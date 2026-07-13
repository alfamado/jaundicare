/**
 * Per-user encrypted offline screening queue.
 *
 * Queue metadata is stored as small SecureStore records. Images remain inside
 * the operating-system app sandbox and are removed after sync or logout.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import * as SecureStore from "expo-secure-store";

import { screeningApi, type ScreeningPayload } from "./api";


const LEGACY_QUEUE_KEY = "jaundicare:offline_queue";
const USER_ID_KEY = "jaundicare_user_id";
const MAX_ATTEMPTS = 5;
const MAX_QUEUE_ITEMS = 20;
const MAX_SECURE_ITEM_CHARACTERS = 1800;
const FILE_PREFIX = "jaundicare-offline-";
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export interface QueuedScreening {
  id: string;
  payload: ScreeningPayload;
  queuedAt: string;
  attempts: number;
  isDeadLetter?: boolean;
}

let isSyncing = false;

function safeKeyPart(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "_");
}

function indexKey(userId: string): string {
  return `jaundicare.offline.index.${safeKeyPart(userId)}`;
}

function itemKey(userId: string, itemId: string): string {
  return `jaundicare.offline.item.${safeKeyPart(userId)}.${safeKeyPart(itemId)}`;
}

async function currentUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

async function readIndex(userId: string): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(indexKey(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

async function writeQueue(userId: string, queue: QueuedScreening[]): Promise<void> {
  if (queue.length > MAX_QUEUE_ITEMS) {
    throw new Error(
      `Offline queue is full. Connect to the internet to sync the existing ${MAX_QUEUE_ITEMS} screenings.`,
    );
  }

  const previousIds = new Set(await readIndex(userId));
  const nextIds = queue.map((item) => item.id);
  for (const item of queue) {
    const serialized = JSON.stringify(item);
    if (serialized.length > MAX_SECURE_ITEM_CHARACTERS) {
      throw new Error("Offline screening data is too large to store securely.");
    }
    await SecureStore.setItemAsync(itemKey(userId, item.id), serialized, SECURE_OPTIONS);
    previousIds.delete(item.id);
  }

  await Promise.all(
    Array.from(previousIds).map((id) =>
      SecureStore.deleteItemAsync(itemKey(userId, id)),
    ),
  );
  await SecureStore.setItemAsync(
    indexKey(userId),
    JSON.stringify(nextIds),
    SECURE_OPTIONS,
  );
}

async function migrateLegacyQueue(userId: string): Promise<void> {
  const secureIds = await readIndex(userId);
  if (secureIds.length > 0) return;

  const legacyRaw = await AsyncStorage.getItem(LEGACY_QUEUE_KEY);
  if (!legacyRaw) return;

  try {
    const parsed = JSON.parse(legacyRaw);
    const legacyItems = Array.isArray(parsed)
      ? (parsed as QueuedScreening[]).slice(0, MAX_QUEUE_ITEMS)
      : [];
    await writeQueue(userId, legacyItems);
    await AsyncStorage.removeItem(LEGACY_QUEUE_KEY);
  } catch (error) {
    console.error("[OfflineStore] Legacy queue migration failed:", error);
  }
}

async function getQueue(): Promise<QueuedScreening[]> {
  const userId = await currentUserId();
  if (!userId) return [];

  await migrateLegacyQueue(userId);
  const ids = await readIndex(userId);
  const records = await Promise.all(
    ids.map((id) => SecureStore.getItemAsync(itemKey(userId, id))),
  );

  return records.flatMap((raw) => {
    if (!raw) return [];
    try {
      return [JSON.parse(raw) as QueuedScreening];
    } catch {
      return [];
    }
  });
}

function isManagedOfflineImage(uri: string): boolean {
  return uri.includes(FILE_PREFIX);
}

async function deleteManagedImage(uri?: string): Promise<void> {
  if (!uri || !isManagedOfflineImage(uri)) return;
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn("[OfflineStore] Could not remove an offline image:", error);
  }
}

export async function saveScreeningOffline(payload: ScreeningPayload): Promise<string> {
  const userId = await currentUserId();
  if (!userId) {
    throw new Error("Sign in before saving a screening offline.");
  }

  const queue = await getQueue();
  if (queue.length >= MAX_QUEUE_ITEMS) {
    throw new Error("Offline queue is full. Connect to the internet before adding another screening.");
  }

  const id = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  let permanentUri = payload.imageUri;

  if (payload.imageUri && !payload.imageUri.startsWith("http")) {
    const filename = `${FILE_PREFIX}${safeKeyPart(userId)}-${id}.jpg`;
    const targetFile = new File(Paths.document, filename);
    const sourceFile = new File(payload.imageUri);
    // Expo SDK 56 copies files asynchronously. Await the copy before the
    // queue record references it, otherwise a reconnect can upload a file
    // that has not reached the app sandbox yet.
    await sourceFile.copy(targetFile);
    permanentUri = targetFile.uri;
  }

  const item: QueuedScreening = {
    id,
    payload: { ...payload, imageUri: permanentUri },
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };

  try {
    await writeQueue(userId, [...queue, item]);
    return id;
  } catch (error) {
    await deleteManagedImage(permanentUri);
    throw error;
  }
}

export async function getPendingCount(): Promise<number> {
  const queue = await getQueue();
  return queue.filter((item) => !item.isDeadLetter).length;
}

export async function syncOfflineStore(): Promise<void> {
  if (isSyncing) return;

  const userId = await currentUserId();
  if (!userId) return;
  const queue = await getQueue();
  const activeItems = queue.filter((item) => !item.isDeadLetter);
  if (activeItems.length === 0) return;

  isSyncing = true;
  const updated = new Map(queue.map((item) => [item.id, item]));
  try {
    await Promise.allSettled(
      activeItems.map(async (item) => {
        try {
          await screeningApi.analyze(item.payload);
          await deleteManagedImage(item.payload.imageUri);
          updated.delete(item.id);
        } catch {
          const current = updated.get(item.id);
          if (!current) return;
          current.attempts += 1;
          if (current.attempts >= MAX_ATTEMPTS) {
            current.isDeadLetter = true;
          }
        }
      }),
    );
    await writeQueue(userId, Array.from(updated.values()));
  } finally {
    isSyncing = false;
  }
}

export async function clearOfflineStore(userIdOverride?: string | null): Promise<void> {
  const userId = userIdOverride ?? (await currentUserId());
  if (!userId) {
    await AsyncStorage.removeItem(LEGACY_QUEUE_KEY);
    return;
  }

  const queue = await getQueue();
  await Promise.all(queue.map((item) => deleteManagedImage(item.payload.imageUri)));
  const ids = await readIndex(userId);
  await Promise.all(
    ids.map((id) => SecureStore.deleteItemAsync(itemKey(userId, id))),
  );
  await SecureStore.deleteItemAsync(indexKey(userId));
  await AsyncStorage.removeItem(LEGACY_QUEUE_KEY);
}
