/**
 * Auth-service JWT: claims include nested `userObject` { userId, username, role, ... }.
 * Subject `sub` is the username.
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function sessionFromAccessToken(token) {
  const decoded = decodeJwtPayload(token);
  if (!decoded) return null;
  const uo = decoded.userObject || {};
  return {
    userId: uo.userId ?? decoded.sub ?? "-",
    username: decoded.sub ?? uo.username ?? "-",
    role: (uo.role || "BİLİNMİYOR").toString().toUpperCase()
  };
}
