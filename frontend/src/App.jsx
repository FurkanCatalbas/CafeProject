import { useMemo, useState } from "react";
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
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [userPayload, setUserPayload] = useState(initialUserPayload);
  const [userIdQuery, setUserIdQuery] = useState("");

  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || "");
  const [refreshTokenValue, setRefreshTokenValue] = useState(localStorage.getItem("refreshToken") || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const isAdmin = sessionInfo?.role === "ADMIN";

  function setTokens(response) {
    const newAccess = response?.access_token || response?.accessToken || "";
    const newRefresh = response?.refresh_token || response?.refreshToken || "";
    setAccessToken(newAccess);
    setRefreshTokenValue(newRefresh);
    localStorage.setItem("accessToken", newAccess);
    localStorage.setItem("refreshToken", newRefresh);
  }

  function clearStatus() {
    setError("");
    setResult(null);
  }

  async function runAction(action) {
    clearStatus();
    setLoading(true);
    try {
      await action();
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function onLogout() {
    setAccessToken("");
    setRefreshTokenValue("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setResult({ message: "Logged out." });
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>Smart Cafe Control Panel</h1>
        <p>UI bridge for existing auth and user-service endpoints.</p>
      </header>

      <section className="card">
        <h2>Session</h2>
        {sessionInfo ? (
          <div className="session">
            <p><strong>User:</strong> {sessionInfo.username}</p>
            <p><strong>Role:</strong> {sessionInfo.role}</p>
            <p><strong>User ID:</strong> {String(sessionInfo.userId)}</p>
            <button onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <p>No active token session.</p>
        )}
      </section>

      <div className="grid">
        <section className="card">
          <h2>Register</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runAction(async () => {
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
          <h2>Login + Refresh</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runAction(async () => {
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
              runAction(async () => {
                const response = await refreshToken(refreshTokenValue);
                setTokens(response);
                setResult(response);
              })
            }
          >
            Refresh Access Token
          </button>
        </section>
      </div>

      <section className="card">
        <h2>User Service Actions</h2>
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
              runAction(async () => {
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
            runAction(async () => {
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
                runAction(async () => {
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
                runAction(async () => {
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
        <h2>API Result</h2>
        {error ? <pre className="error">{error}</pre> : <pre>{JSON.stringify(result, null, 2) || "No result yet."}</pre>}
      </section>
    </div>
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
