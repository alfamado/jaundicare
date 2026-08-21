const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://jaundicare-api.onrender.com").replace(/\/$/, "");

const storageKeys = {
  access: "jaundicare_web_access_token",
  refresh: "jaundicare_web_refresh_token",
};

let refreshInFlight = null;

export function getSession() {
  return {
    accessToken: sessionStorage.getItem(storageKeys.access),
    refreshToken: sessionStorage.getItem(storageKeys.refresh),
  };
}

export function saveSession(tokens) {
  sessionStorage.setItem(storageKeys.access, tokens.access_token);
  sessionStorage.setItem(storageKeys.refresh, tokens.refresh_token);
}

export function clearSession() {
  sessionStorage.removeItem(storageKeys.access);
  sessionStorage.removeItem(storageKeys.refresh);
}

async function responseData(response) {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "We could not complete that request. Please try again.");
  }
  return data;
}

async function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { refreshToken } = getSession();
      if (!refreshToken) throw new Error("Your session has ended. Please sign in again.");

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await responseData(response);
      saveSession(data);
      return data.access_token;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function request(path, options = {}, retry = true) {
  const { accessToken } = getSession();
  const headers = new Headers(options.headers || {});
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry && getSession().refreshToken) {
    try {
      await refreshSession();
      return request(path, options, false);
    } catch {
      clearSession();
    }
  }

  return responseData(response);
}

export async function requestOtp({ phoneNumber, language }) {
  return request("/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber, language }),
  });
}

export async function verifyOtp({ phoneNumber, code }) {
  const data = await request("/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber, code }),
  });
  saveSession(data);
  return data;
}

export async function signOut() {
  const { refreshToken } = getSession();
  try {
    if (refreshToken) {
      await request("/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } finally {
    clearSession();
  }
}

export { API_BASE_URL };
