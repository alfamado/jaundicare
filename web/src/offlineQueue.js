const DATABASE_NAME = "jaundicare-web-offline";
const DATABASE_VERSION = 1;
const QUEUE_STORE = "screeningQueue";
const KEY_STORE = "keys";
const KEY_ID = "queue-encryption-key";
const MAX_QUEUE_ITEMS = 5;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Browser storage failed."));
  });
}

function transactionComplete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Browser storage failed."));
    transaction.onabort = () => reject(transaction.error || new Error("Browser storage was cancelled."));
  });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
        store.createIndex("ownerId", "ownerId", { unique: false });
      }
      if (!db.objectStoreNames.contains(KEY_STORE)) db.createObjectStore(KEY_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Offline browser storage is unavailable."));
  });
}

async function getEncryptionKey() {
  const db = await openDatabase();
  try {
    const readTransaction = db.transaction(KEY_STORE, "readonly");
    const existing = await requestResult(readTransaction.objectStore(KEY_STORE).get(KEY_ID));
    await transactionComplete(readTransaction);
    if (existing?.key) return existing.key;

    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    const writeTransaction = db.transaction(KEY_STORE, "readwrite");
    writeTransaction.objectStore(KEY_STORE).put({ id: KEY_ID, key });
    await transactionComplete(writeTransaction);
    return key;
  } finally {
    db.close();
  }
}

async function queuedRecords(ownerId) {
  const db = await openDatabase();
  try {
    const transaction = db.transaction(QUEUE_STORE, "readonly");
    const records = await requestResult(transaction.objectStore(QUEUE_STORE).index("ownerId").getAll(ownerId));
    await transactionComplete(transaction);
    return records.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  } finally {
    db.close();
  }
}

export function offlineQueueSupported() {
  return Boolean(window.indexedDB && window.crypto?.subtle && window.File);
}

export async function getQueuedScreeningCount(ownerId) {
  if (!offlineQueueSupported() || !ownerId) return 0;
  return (await queuedRecords(ownerId)).length;
}

export async function queueScreening({ ownerId, image, fields, language }) {
  if (!offlineQueueSupported()) throw new Error("This browser cannot securely queue an offline screening.");
  if (!ownerId || !image) throw new Error("A signed-in account and baby photo are required to queue a screening.");
  if (image.size > MAX_IMAGE_BYTES) throw new Error("Image must be 8 MB or smaller before it can be queued.");

  const existing = await queuedRecords(ownerId);
  if (existing.length >= MAX_QUEUE_ITEMS) throw new Error("This browser already has five queued screenings. Reconnect and sync before adding another.");

  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, await image.arrayBuffer());
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const record = {
    id,
    ownerId,
    createdAt: new Date().toISOString(),
    fields,
    language,
    image: {
      bytes: encrypted,
      iv: iv.buffer,
      name: image.name || "screening-image.jpg",
      type: image.type || "image/jpeg",
      lastModified: image.lastModified || Date.now(),
    },
  };

  const db = await openDatabase();
  try {
    const transaction = db.transaction(QUEUE_STORE, "readwrite");
    transaction.objectStore(QUEUE_STORE).put(record);
    await transactionComplete(transaction);
  } finally {
    db.close();
  }
  return id;
}

async function queuedFile(record) {
  const key = await getEncryptionKey();
  const bytes = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(record.image.iv) }, key, record.image.bytes);
  return new File([bytes], record.image.name, { type: record.image.type, lastModified: record.image.lastModified });
}

export async function removeQueuedScreening(id) {
  const db = await openDatabase();
  try {
    const transaction = db.transaction(QUEUE_STORE, "readwrite");
    transaction.objectStore(QUEUE_STORE).delete(id);
    await transactionComplete(transaction);
  } finally {
    db.close();
  }
}

export async function syncQueuedScreenings({ ownerId, submit }) {
  const records = await queuedRecords(ownerId);
  let synced = 0;
  let failed = 0;
  for (const record of records) {
    try {
      const image = await queuedFile(record);
      await submit({ image, fields: record.fields, language: record.language });
      await removeQueuedScreening(record.id);
      synced += 1;
    } catch {
      failed += 1;
    }
  }
  return { synced, failed, remaining: records.length - synced };
}

export async function clearQueuedScreenings(ownerId) {
  const records = await queuedRecords(ownerId);
  await Promise.all(records.map((record) => removeQueuedScreening(record.id)));
}
