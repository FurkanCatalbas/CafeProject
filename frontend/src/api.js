/**
 * Tüm API çağrıları API Gateway (10101) üzerinden gider: /auth-service/..., /user-service/...
 * Yaygın hata: VITE_API_BASE=user-service portu (8080) — bu adres gateway değil; otomatik 10101’e yönlendirilir.
 */
function normalizeApiBaseUrl(raw) {
  if (raw == null || raw === "") return raw;
  if (import.meta.env.VITE_SKIP_API_BASE_FIX === "true") {
    return raw.replace(/\/$/, "");
  }
  try {
    const u = new URL(raw);
    const port = u.port || (u.protocol === "https:" ? "443" : "80");
    if (
      (u.hostname === "localhost" || u.hostname === "127.0.0.1") &&
      port === "8080"
    ) {
      return `${u.protocol}//${u.hostname}:10101`;
    }
  } catch {
    return raw;
  }
  return raw.replace(/\/$/, "");
}

function resolveApiBase() {
  const raw = import.meta.env.VITE_API_BASE;
  const v = typeof raw === "string" ? raw.trim() : "";
  if (v !== "") return normalizeApiBaseUrl(v);
  if (import.meta.env.DEV) return "";
  return "http://localhost:10101";
}

const API_BASE = resolveApiBase();

/** user-service cevapları `QueryResponse`: asıl kayıt `data` içinde; aksi halde Getir yanlış ID ile aranır. */
export function unwrapUserServiceResponse(json) {
  if (json != null && typeof json === "object" && Object.prototype.hasOwnProperty.call(json, "data")) {
    return json.data;
  }
  return json;
}

function withBase(path) {
  if (!API_BASE) return path;
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(withBase(path), options);
  } catch (e) {
    const err = new Error(e?.message || "Failed to fetch");
    err.name = e?.name || "TypeError";
    throw err;
  }
  const raw = await response.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.detail ||
      (typeof data?.error === "string" ? data.error : null) ||
      (data?.errors ? JSON.stringify(data.errors) : null) ||
      (data && typeof data === "object" ? JSON.stringify(data) : "") ||
      (raw && raw.trim()) ||
      `Request failed with ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}

export function registerUser(payload) {
  return request("/auth-service/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload) {
  return request("/auth-service/api/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function refreshToken(refreshTokenValue) {
  return request("/auth-service/api/auth/refresh-token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshTokenValue}`
    }
  });
}

export async function getUserById(id, accessToken) {
  const json = await request(`/user-service/api/users/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return unwrapUserServiceResponse(json);
}

export async function createUser(payload, accessToken) {
  const json = await request("/user-service/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
  return unwrapUserServiceResponse(json);
}

export async function updateUser(payload, accessToken) {
  const json = await request("/user-service/api/users", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
  return unwrapUserServiceResponse(json);
}

export async function deleteUser(id, accessToken) {
  const json = await request(`/user-service/api/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return unwrapUserServiceResponse(json);
}
