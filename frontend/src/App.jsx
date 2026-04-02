import { useMemo, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import {
  createUser,
  deleteUser,
  getUserById,
  loginUser,
  refreshToken,
  registerUser,
  updateUser
} from "./api";

const initialRegister = {
  type: 1,
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  emailAddress: "",
  roleName: "USER"
};

const initialLogin = {
  username: "",
  password: ""
};

const initialUserPayload = {
  id: "",
  status: 1,
  type: 1,
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  emailAddress: "",
  roleName: "USER"
};

function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch (_error) {
    return null;
  }
}

function hataMesaji(err) {
  const m = err?.message || "";
  if (m.includes("Unexpected error") || m === "Unexpected error") {
    return "Beklenmeyen bir hata oluştu.";
  }
  if (m.includes("Request failed")) {
    return "İstek başarısız oldu. Sunucu çalışıyor mu kontrol edin.";
  }
  return m || "Beklenmeyen bir hata oluştu.";
}

export default function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || "");
  const [refreshTokenValue, setRefreshTokenValue] = useState(localStorage.getItem("refreshToken") || "");
  const [globalError, setGlobalError] = useState("");

  const sessionInfo = useMemo(() => {
    if (!accessToken) return null;
    const decoded = decodeJwt(accessToken);
    if (!decoded) return null;
    return {
      userId: decoded.userId || decoded.sub || "-",
      username: decoded.sub || "-",
      role: decoded.role || "BİLİNMİYOR"
    };
  }, [accessToken]);

  function setTokens(response) {
    const newAccess = response?.access_token || response?.accessToken || "";
    const newRefresh = response?.refresh_token || response?.refreshToken || "";
    setAccessToken(newAccess);
    setRefreshTokenValue(newRefresh);
    localStorage.setItem("accessToken", newAccess);
    localStorage.setItem("refreshToken", newRefresh);
  }

  function onLogout() {
    setAccessToken("");
    setRefreshTokenValue("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="navbar">
          <div className="navbar-left">
            <div className="brand-block">
              <Link to="/" className="brand" style={{ textDecoration: "none" }}>
                CafeProject
              </Link>
              <span className="brand-tagline">Akıllı kafe deneyimi</span>
            </div>
            <nav className="nav-links">
              <Link to="/">Ana sayfa</Link>
              <Link to="/menu">Menü</Link>
              <Link to="/users">Kullanıcılar</Link>
            </nav>
          </div>
          <div className="navbar-right">
            {sessionInfo ? (
              <>
                <span className="nav-user" title={`${sessionInfo.username} · ${sessionInfo.role}`}>
                  {sessionInfo.username} · {sessionInfo.role}
                </span>
                <button type="button" className="secondary small" onClick={onLogout}>
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Giriş</Link>
                <Link to="/register">Kayıt</Link>
              </>
            )}
          </div>
        </header>

        <main className="page">
          {globalError && <div className="banner-error">{globalError}</div>}
          <Routes>
            <Route path="/" element={<HomePage sessionInfo={sessionInfo} />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route
              path="/login"
              element={
                <LoginPage
                  loginUser={loginUser}
                  refreshTokenApi={refreshToken}
                  setTokens={setTokens}
                  refreshTokenValue={refreshTokenValue}
                  setGlobalError={setGlobalError}
                />
              }
            />
            <Route
              path="/register"
              element={
                <RegisterPage registerUser={registerUser} setTokens={setTokens} setGlobalError={setGlobalError} />
              }
            />
            <Route
              path="/users"
              element={
                <UsersPage
                  accessToken={accessToken}
                  sessionInfo={sessionInfo}
                  getUserById={getUserById}
                  createUser={createUser}
                  updateUser={updateUser}
                  deleteUser={deleteUser}
                  setGlobalError={setGlobalError}
                />
              }
            />
          </Routes>
        </main>

        <footer className="site-footer">
          <p>© {new Date().getFullYear()} CafeProject — Kahve, bağlantı ve kolay yönetim.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function HomePage({ sessionInfo }) {
  return (
    <>
      <section className="hero hero-modern">
        <h1>CafeProject&apos;e hoş geldiniz</h1>
        <p>
          Sipariş akışınızı ve müşteri deneyiminizi tek yerden yönetin. Modern arayüz, güvenli giriş ve
          kullanıcı yönetimi backend servislerinizle bağlantılıdır.
        </p>
        <div className="hero-badges">
          <span className="badge">Canlı oturum</span>
          <span className="badge">JWT kimlik doğrulama</span>
          <span className="badge">Ağ geçidi üzerinden API</span>
        </div>
        <div className="feature-strip">
          <div className="feature-pill">
            <h3>Taze kahve</h3>
            <p>Çekirdekler düzenli kavrulur; menü önizlemesi burada.</p>
          </div>
          <div className="feature-pill">
            <h3>Akıllı yönetim</h3>
            <p>Sipariş ve barista panelleri ileride bu yapıya eklenebilir.</p>
          </div>
          <div className="feature-pill">
            <h3>Güvenli hesap</h3>
            <p>Kayıt ve giriş, mevcut kimlik servisinizle çalışır.</p>
          </div>
        </div>
      </section>

      <section className="card card-elevated">
        <h2>Öne çıkanlar</h2>
        <ul className="highlights">
          <li>Her 30 dakikada bir taze demleme rutini.</li>
          <li>Sipariş takibi için barista paneli (yakında).</li>
          <li>Giriş ve profiller API&apos;nize bağlıdır.</li>
        </ul>
      </section>

      <section className="card card-elevated">
        <h2>Oturumunuz</h2>
        {sessionInfo ? (
          <div className="session">
            <p>
              <strong>Kullanıcı:</strong> {sessionInfo.username}
            </p>
            <p>
              <strong>Rol:</strong> {sessionInfo.role}
            </p>
            <p>
              <strong>Kullanıcı ID:</strong> {String(sessionInfo.userId)}
            </p>
          </div>
        ) : (
          <p className="card-subtitle" style={{ margin: 0 }}>
            Misafir olarak geziyorsunuz. Giriş veya kayıt için üst menüyü kullanın.
          </p>
        )}
      </section>
    </>
  );
}

function MenuPage() {
  return (
    <>
      <section className="hero hero-modern">
        <h1>İmza menümüz</h1>
        <p>Örnek fiyatlar ve açıklamalar; sipariş entegrasyonu ileride eklenecek.</p>
      </section>
      <section className="menu-grid">
        <MenuCard
          emoji="☕"
          name="Espresso"
          description="Yoğun gövde, dengeli ekstraksiyon."
          price="85 ₺"
        />
        <MenuCard
          emoji="🥛"
          name="Cappuccino"
          description="İki shot espresso ve ipeksi süt köpüğü."
          price="110 ₺"
        />
        <MenuCard
          emoji="🧊"
          name="Cold Brew"
          description="Soğuk demleme, yumuşak ve ferahlatıcı."
          price="120 ₺"
        />
        <MenuCard
          emoji="🍵"
          name="Matcha Latte"
          description="Kremalı yeşil çay ve mikroköpük."
          price="125 ₺"
        />
      </section>
    </>
  );
}

function MenuCard({ emoji, name, description, price }) {
  return (
    <article className="menu-card">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span className="menu-emoji" aria-hidden>
          {emoji}
        </span>
        <div>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="menu-card-footer">
        <span className="price">{price}</span>
      </div>
    </article>
  );
}

function LoginPage({ loginUser, refreshTokenApi, setTokens, refreshTokenValue, setGlobalError }) {
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(action) {
    setError("");
    setGlobalError("");
    setResult(null);
    setLoading(true);
    try {
      await action();
    } catch (err) {
      const msg = hataMesaji(err);
      setError(msg);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero hero-modern">
        <h1>Giriş</h1>
        <p>CafeProject hesabınızla oturum açın.</p>
      </section>
      <section className="card card-elevated">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const response = await loginUser(loginForm);
              setTokens(response);
              setResult(response);
            });
          }}
        >
          <Input
            label="Kullanıcı adı"
            value={loginForm.username}
            onChange={(v) => setLoginForm((s) => ({ ...s, username: v }))}
            required
          />
          <Input
            label="Şifre"
            type="password"
            value={loginForm.password}
            onChange={(v) => setLoginForm((s) => ({ ...s, password: v }))}
            required
          />
          <button disabled={loading} type="submit">
            Giriş yap
          </button>
        </form>
        <button
          type="button"
          className="secondary"
          style={{ marginTop: 12 }}
          disabled={!refreshTokenValue || loading}
          onClick={() =>
            run(async () => {
              const response = await refreshTokenApi(refreshTokenValue);
              setTokens(response);
              setResult(response);
            })
          }
        >
          Erişim jetonunu yenile
        </button>
      </section>
      <section className="card card-elevated">
        <h2>Sonuç</h2>
        {error ? (
          <pre className="error">{error}</pre>
        ) : (
          <pre>{result != null ? JSON.stringify(result, null, 2) : <span className="empty-result">Henüz sonuç yok.</span>}</pre>
        )}
      </section>
    </>
  );
}

function RegisterPage({ registerUser, setTokens, setGlobalError }) {
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(action) {
    setError("");
    setGlobalError("");
    setResult(null);
    setLoading(true);
    try {
      await action();
    } catch (err) {
      const msg = hataMesaji(err);
      setError(msg);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero hero-modern">
        <h1>Hesap oluştur</h1>
        <p>CafeProject platformuna kayıt olun.</p>
      </section>
      <section className="card card-elevated">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const response = await registerUser({
                ...registerForm,
                type: Number(registerForm.type)
              });
              setTokens(response);
              setResult(response);
            });
          }}
        >
          <Input label="Tip" value={registerForm.type} onChange={(v) => setRegisterForm((s) => ({ ...s, type: v }))} />
          <Input
            label="Kullanıcı adı"
            value={registerForm.username}
            onChange={(v) => setRegisterForm((s) => ({ ...s, username: v }))}
            required
          />
          <Input
            label="Şifre"
            type="password"
            value={registerForm.password}
            onChange={(v) => setRegisterForm((s) => ({ ...s, password: v }))}
            required
          />
          <Input label="Ad" value={registerForm.firstName} onChange={(v) => setRegisterForm((s) => ({ ...s, firstName: v }))} />
          <Input label="Soyad" value={registerForm.lastName} onChange={(v) => setRegisterForm((s) => ({ ...s, lastName: v }))} />
          <Input
            label="E-posta"
            type="email"
            value={registerForm.emailAddress}
            onChange={(v) => setRegisterForm((s) => ({ ...s, emailAddress: v }))}
            required
          />
          <Input
            label="Rol (USER / ADMIN)"
            value={registerForm.roleName}
            onChange={(v) => setRegisterForm((s) => ({ ...s, roleName: v }))}
            required
          />
          <button disabled={loading} type="submit">
            Kayıt ol
          </button>
        </form>
      </section>
      <section className="card card-elevated">
        <h2>Sonuç</h2>
        {error ? (
          <pre className="error">{error}</pre>
        ) : (
          <pre>{result != null ? JSON.stringify(result, null, 2) : <span className="empty-result">Henüz sonuç yok.</span>}</pre>
        )}
      </section>
    </>
  );
}

function UsersPage({
  accessToken,
  sessionInfo,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  setGlobalError
}) {
  const [userPayload, setUserPayload] = useState(initialUserPayload);
  const [userIdQuery, setUserIdQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = sessionInfo?.role === "ADMIN";

  async function run(action) {
    setError("");
    setGlobalError("");
    setResult(null);
    setLoading(true);
    try {
      await action();
    } catch (err) {
      const msg = hataMesaji(err);
      setError(msg);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero hero-modern">
        <h1>Kullanıcı yönetimi</h1>
        <p>İşlemler ağ geçidi üzerinden kullanıcı servisine bağlanır.</p>
      </section>

      <section className="card card-elevated">
        <p className="card-subtitle" style={{ marginTop: 0 }}>
          Geçerli bir erişim jetonu gerekir (giriş veya kayıt sonrası).
        </p>
        <div className="actions-row">
          <Input
            label="Kullanıcı ID ile getir"
            value={userIdQuery}
            onChange={setUserIdQuery}
            placeholder="örn. 1"
          />
          <button
            type="button"
            disabled={!accessToken || !userIdQuery || loading}
            onClick={() =>
              run(async () => {
                const response = await getUserById(Number(userIdQuery), accessToken);
                setResult(response);
              })
            }
          >
            Getir
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const payload = {
                ...userPayload,
                id: userPayload.id ? Number(userPayload.id) : undefined,
                status: Number(userPayload.status),
                type: Number(userPayload.type)
              };
              const response = await createUser(payload, accessToken);
              setResult(response);
            });
          }}
        >
          <div className="grid fields">
            <Input label="ID (yalnızca güncelleme)" value={userPayload.id} onChange={(v) => setUserPayload((s) => ({ ...s, id: v }))} />
            <Input label="Durum" value={userPayload.status} onChange={(v) => setUserPayload((s) => ({ ...s, status: v }))} />
            <Input label="Tip" value={userPayload.type} onChange={(v) => setUserPayload((s) => ({ ...s, type: v }))} />
            <Input
              label="Kullanıcı adı"
              value={userPayload.username}
              onChange={(v) => setUserPayload((s) => ({ ...s, username: v }))}
              required
            />
            <Input
              label="Şifre"
              type="password"
              value={userPayload.password}
              onChange={(v) => setUserPayload((s) => ({ ...s, password: v }))}
              required
            />
            <Input label="Ad" value={userPayload.firstName} onChange={(v) => setUserPayload((s) => ({ ...s, firstName: v }))} />
            <Input label="Soyad" value={userPayload.lastName} onChange={(v) => setUserPayload((s) => ({ ...s, lastName: v }))} />
            <Input
              label="E-posta"
              type="email"
              value={userPayload.emailAddress}
              onChange={(v) => setUserPayload((s) => ({ ...s, emailAddress: v }))}
              required
            />
            <Input
              label="Rol (USER / ADMIN)"
              value={userPayload.roleName}
              onChange={(v) => setUserPayload((s) => ({ ...s, roleName: v }))}
              required
            />
          </div>

          <div className="button-row">
            <button disabled={!accessToken || loading} type="submit">
              Kullanıcı oluştur
            </button>
            <button
              type="button"
              className="secondary"
              disabled={!accessToken || !userPayload.id || loading}
              onClick={() =>
                run(async () => {
                  const payload = {
                    ...userPayload,
                    id: Number(userPayload.id),
                    status: Number(userPayload.status),
                    type: Number(userPayload.type)
                  };
                  const response = await updateUser(payload, accessToken);
                  setResult(response);
                })
              }
            >
              Güncelle
            </button>
            <button
              type="button"
              className="danger"
              disabled={!accessToken || !userPayload.id || !isAdmin || loading}
              onClick={() =>
                run(async () => {
                  const response = await deleteUser(Number(userPayload.id), accessToken);
                  setResult(response || { mesaj: "Silindi" });
                })
              }
            >
              Sil (yalnızca ADMIN)
            </button>
          </div>
        </form>
      </section>

      <section className="card card-elevated">
        <h2>Sonuç</h2>
        {error ? (
          <pre className="error">{error}</pre>
        ) : (
          <pre>{result != null ? JSON.stringify(result, null, 2) : <span className="empty-result">Henüz sonuç yok.</span>}</pre>
        )}
      </section>
    </>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "", required = false }) {
  return (
    <label className="input-group">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}
