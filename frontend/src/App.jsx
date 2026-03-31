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
      role: decoded.role || "UNKNOWN"
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
            <span className="brand">Cafe Nova</span>
            <nav className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/menu">Menu</Link>
              <Link to="/users">Users</Link>
            </nav>
          </div>
          <div className="navbar-right">
            {sessionInfo ? (
              <>
                <span className="nav-user">
                  {sessionInfo.username} ({sessionInfo.role})
                </span>
                <button className="secondary small" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </header>

        <main className="page">
          {globalError && <div className="banner-error">{globalError}</div>}
          <Routes>
            <Route
              path="/"
              element={<HomePage sessionInfo={sessionInfo} />}
            />
            <Route
              path="/menu"
              element={<MenuPage />}
            />
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
                <RegisterPage
                  registerUser={registerUser}
                  setTokens={setTokens}
                  setGlobalError={setGlobalError}
                />
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
      </div>
    </BrowserRouter>
  );
}

function HomePage({ sessionInfo }) {
  return (
    <>
      <section className="hero hero-cafe">
        <h1>Welcome to Cafe Nova</h1>
        <p>Smart cafe experience, powered by your backend services.</p>
      </section>
      <section className="card">
        <h2>Today&apos;s Highlights</h2>
        <ul className="highlights">
          <li>Freshly roasted beans brewed every 30 minutes.</li>
          <li>Smart barista dashboard (coming soon) to track your orders.</li>
          <li>Secure login & user profiles already wired to your APIs.</li>
        </ul>
      </section>
      <section className="card">
        <h2>Your Session</h2>
        {sessionInfo ? (
          <div className="session">
            <p><strong>User:</strong> {sessionInfo.username}</p>
            <p><strong>Role:</strong> {sessionInfo.role}</p>
            <p><strong>User ID:</strong> {String(sessionInfo.userId)}</p>
          </div>
        ) : (
          <p>You are browsing as a guest. Use the navbar to log in or register.</p>
        )}
      </section>
    </>
  );
}

function MenuPage() {
  return (
    <>
      <section className="hero">
        <h1>Our Signature Menu</h1>
        <p>This is a static preview; ordering logic will hook into future cafe services.</p>
      </section>
      <section className="card menu-grid">
        <MenuItem name="Espresso" description="Rich, intense, perfectly extracted." price="€2.50" />
        <MenuItem name="Cappuccino" description="Silky foam and double shot espresso." price="€3.40" />
        <MenuItem name="Cold Brew" description="Slow-brewed, smooth and refreshing." price="€3.80" />
        <MenuItem name="Matcha Latte" description="Creamy green tea with microfoam." price="€3.90" />
      </section>
    </>
  );
}

function MenuItem({ name, description, price }) {
  return (
    <div className="menu-item">
      <div>
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
      <span className="price">{price}</span>
    </div>
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
      const msg = err.message || "Unexpected error";
      setError(msg);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero">
        <h1>Login</h1>
        <p>Access your smart cafe account.</p>
      </section>
      <section className="card">
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
          <Input label="Username" value={loginForm.username} onChange={(v) => setLoginForm((s) => ({ ...s, username: v }))} required />
          <Input label="Password" type="password" value={loginForm.password} onChange={(v) => setLoginForm((s) => ({ ...s, password: v }))} required />
          <button disabled={loading} type="submit">Login</button>
        </form>
        <button
          className="secondary"
          disabled={!refreshTokenValue || loading}
          onClick={() =>
            run(async () => {
              const response = await refreshTokenApi(refreshTokenValue);
              setTokens(response);
              setResult(response);
            })
          }
        >
          Refresh Access Token
        </button>
      </section>
      <section className="card">
        <h2>Result</h2>
        {error ? <pre className="error">{error}</pre> : <pre>{JSON.stringify(result, null, 2) || "No result yet."}</pre>}
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
      const msg = err.message || "Unexpected error";
      setError(msg);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero">
        <h1>Create an account</h1>
        <p>Sign up to start using the smart cafe platform.</p>
      </section>
      <section className="card">
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
          <Input label="Type" value={registerForm.type} onChange={(v) => setRegisterForm((s) => ({ ...s, type: v }))} />
          <Input label="Username" value={registerForm.username} onChange={(v) => setRegisterForm((s) => ({ ...s, username: v }))} required />
          <Input label="Password" type="password" value={registerForm.password} onChange={(v) => setRegisterForm((s) => ({ ...s, password: v }))} required />
          <Input label="First Name" value={registerForm.firstName} onChange={(v) => setRegisterForm((s) => ({ ...s, firstName: v }))} />
          <Input label="Last Name" value={registerForm.lastName} onChange={(v) => setRegisterForm((s) => ({ ...s, lastName: v }))} />
          <Input label="Email" type="email" value={registerForm.emailAddress} onChange={(v) => setRegisterForm((s) => ({ ...s, emailAddress: v }))} required />
          <Input label="Role (USER/ADMIN)" value={registerForm.roleName} onChange={(v) => setRegisterForm((s) => ({ ...s, roleName: v }))} required />
          <button disabled={loading} type="submit">Register</button>
        </form>
      </section>
      <section className="card">
        <h2>Result</h2>
        {error ? <pre className="error">{error}</pre> : <pre>{JSON.stringify(result, null, 2) || "No result yet."}</pre>}
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
      const msg = err.message || "Unexpected error";
      setError(msg);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero">
        <h1>User Management</h1>
        <p>These actions are wired to `user-service` APIs via the gateway.</p>
      </section>

      <section className="card">
        <p>Requires a valid access token from login/register.</p>
        <div className="actions-row">
          <Input
            label="Get User By ID"
            value={userIdQuery}
            onChange={setUserIdQuery}
            placeholder="e.g. 1"
          />
          <button
            disabled={!accessToken || !userIdQuery || loading}
            onClick={() =>
              run(async () => {
                const response = await getUserById(Number(userIdQuery), accessToken);
                setResult(response);
              })
            }
          >
            Fetch User
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
            <Input label="ID (for update only)" value={userPayload.id} onChange={(v) => setUserPayload((s) => ({ ...s, id: v }))} />
            <Input label="Status" value={userPayload.status} onChange={(v) => setUserPayload((s) => ({ ...s, status: v }))} />
            <Input label="Type" value={userPayload.type} onChange={(v) => setUserPayload((s) => ({ ...s, type: v }))} />
            <Input label="Username" value={userPayload.username} onChange={(v) => setUserPayload((s) => ({ ...s, username: v }))} required />
            <Input label="Password" type="password" value={userPayload.password} onChange={(v) => setUserPayload((s) => ({ ...s, password: v }))} required />
            <Input label="First Name" value={userPayload.firstName} onChange={(v) => setUserPayload((s) => ({ ...s, firstName: v }))} />
            <Input label="Last Name" value={userPayload.lastName} onChange={(v) => setUserPayload((s) => ({ ...s, lastName: v }))} />
            <Input label="Email" type="email" value={userPayload.emailAddress} onChange={(v) => setUserPayload((s) => ({ ...s, emailAddress: v }))} required />
            <Input label="Role (USER/ADMIN)" value={userPayload.roleName} onChange={(v) => setUserPayload((s) => ({ ...s, roleName: v }))} required />
          </div>

          <div className="button-row">
            <button disabled={!accessToken || loading} type="submit">Create User</button>
            <button
              className="secondary"
              disabled={!accessToken || !userPayload.id || loading}
              type="button"
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
              Update User
            </button>
            <button
              className="danger"
              disabled={!accessToken || !userPayload.id || !isAdmin || loading}
              type="button"
              onClick={() =>
                run(async () => {
                  const response = await deleteUser(Number(userPayload.id), accessToken);
                  setResult(response || { message: "Deleted" });
                })
              }
            >
              Delete User (ADMIN)
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Result</h2>
        {error ? <pre className="error">{error}</pre> : <pre>{JSON.stringify(result, null, 2) || "No result yet."}</pre>}
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
