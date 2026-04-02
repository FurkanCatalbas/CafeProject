/**
 * Kullanıcıya gösterilecek Türkçe hata metinleri (API / ağ).
 */

export function hataMesaji(err) {
  const m = err?.message || "";
  const status = err?.status;

  if (m.startsWith("VALIDATION:")) {
    return m.slice("VALIDATION:".length);
  }

  if (status === 404 || /\b404\b/.test(m)) {
    return "Bu kullanıcı kimliği için kayıt bulunamadı. ID’yi kontrol edip tekrar deneyin.";
  }
  if (status === 401) {
    return "Oturum geçersiz veya süresi dolmuş. Çıkış yapıp tekrar giriş yapın.";
  }
  if (status === 403) {
    if (m.includes("Request failed")) {
      return "Erişim reddedildi (403). .env içinde VITE_API_BASE’i boş bırakıp `npm run dev` kullanın; gerekirse çıkış yapıp yeniden giriş yapın.";
    }
    return "Bu işlem için yetkiniz yok.";
  }
  if (status === 400) {
    if (m && !/^Request failed with 400$/i.test(m) && !m.includes("Gateway")) {
      return m;
    }
    return "Gönderilen bilgiler geçersiz. Alanları kontrol edin.";
  }
  if (status === 409) {
    return m && !m.includes("Request failed") ? m : "Bu kayıt zaten var (ör. kullanıcı adı veya e-posta).";
  }
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return "Sunucu geçici olarak yanıt veremiyor. Bir süre sonra tekrar deneyin.";
  }

  if (m.includes("Unexpected error") || m === "Unexpected error") {
    return "Beklenmeyen bir hata oluştu.";
  }
  if (m === "Failed to fetch" || m.includes("NetworkError") || m.includes("ECONNREFUSED")) {
    return "Sunucuya bağlanılamadı. Sayfayı Vite ile (npm run dev) açtığınızdan ve gateway’in 10101 portunda çalıştığından emin olun.";
  }
  if (m.includes("Request failed")) {
    if (m.includes("403")) {
      return "Erişim reddedildi (403). 1) .env içinde VITE_API_BASE satırını silin veya boş bırakın, 2) `npm run dev` ile çalıştırın, 3) Çıkış → Giriş. Hâlâ olursa tarayıcıda site verisini temizleyin (localhost depolama).";
    }
    return `İstek başarısız oldu. Gateway (10101) ve servisler çalışıyor mu kontrol edin. (${m})`;
  }
  return m || "Beklenmeyen bir hata oluştu.";
}

/** Kullanıcı ID alanı: pozitif tam sayı */
export function parseUserIdQuery(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) {
    return { ok: false, error: "VALIDATION:Lütfen bir kullanıcı ID’si girin." };
  }
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1) {
    return { ok: false, error: "VALIDATION:Kullanıcı ID’si pozitif bir tam sayı olmalıdır (örn. 1, 2, 42)." };
  }
  return { ok: true, value: n };
}

/** Kayıt formu: tip alanı */
export function normalizeRegisterType(raw) {
  if (raw === "" || raw == null) return 1;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1;
}

/** Formdan gelen sayı alanları (durum, tip, id). Boş string → fallback ("" sayıya çevrilince 0 olurdu). */
export function safeInt(raw, fallback) {
  if (raw === "" || raw === null || raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}
