import { useState } from "react";
import { Input } from "../components/Input";
import { ResultPanel } from "../components/ResultPanel";
import { initialLogin } from "../formDefaults";
import { useAsyncAction } from "../hooks/useAsyncAction";

export function LoginPage({ loginUser, refreshTokenApi, setTokens, refreshTokenValue, setGlobalError }) {
  const [loginForm, setLoginForm] = useState(initialLogin);
  const { run, result, setResult, error, loading } = useAsyncAction(setGlobalError);

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
      <ResultPanel error={error} result={result} />
    </>
  );
}
