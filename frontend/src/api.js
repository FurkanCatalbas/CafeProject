const API_BASE = import.meta.env.VITE_API_BASE || "";

function withBase(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

async function request(path, options = {}) {
  const response = await fetch(withBase(path), options);
  let data = null;

  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || `Request failed with ${response.status}`;
    throw new Error(message);
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

export function getUserById(id, accessToken) {
  return request(`/user-service/api/users/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function createUser(payload, accessToken) {
  return request("/user-service/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
}

export function updateUser(payload, accessToken) {
  return request("/user-service/api/users", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
}

export function deleteUser(id, accessToken) {
  return request(`/user-service/api/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
