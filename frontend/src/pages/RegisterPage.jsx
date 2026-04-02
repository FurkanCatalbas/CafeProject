import { useState } from "react";
import { Input } from "../components/Input";
import { ResultPanel } from "../components/ResultPanel";
import { initialRegister } from "../formDefaults";
import { normalizeRegisterType } from "../errors";
import { useAsyncAction } from "../hooks/useAsyncAction";

/**
 * Kayıt auth servisinde yapılır; JWT içindeki userId auth veritabanına aittir.
 * Aynı hesap için kullanıcı servisinde de profil oluşturulursa "Kullanıcı ID ile getir" doğru ID ile çalışır.
 */
export function RegisterPage({ registerUser, createUser, setTokens, setGlobalError }) {
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const { run, result, setResult, error, loading } = useAsyncAction(setGlobalError);

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
                type: normalizeRegisterType(registerForm.type)
              });
              setTokens(response);
              const access = response?.access_token ?? response?.accessToken;
              const userPayload = {
                status: 1,
                type: normalizeRegisterType(registerForm.type),
                username: registerForm.username,
                password: registerForm.password,
                firstName: registerForm.firstName,
                lastName: registerForm.lastName,
                emailAddress: registerForm.emailAddress,
                roleName: registerForm.roleName
              };
              if (access) {
                try {
                  const userSvc = await createUser(userPayload, access);
                  setResult({
                    auth: response,
                    kullaniciServisiProfil: userSvc,
                    bilgi:
                      "Kullanıcılar sayfasında «Kullanıcı ID ile getir» için kullanın: kullaniciServisiProfil.id (auth JWT içindeki userId değil)."
                  });
                } catch (userSvcErr) {
                  setResult({
                    auth: response,
                    kullaniciServisiHata: userSvcErr?.message || String(userSvcErr),
                    bilgi:
                      "Giriş başarılı; kullanıcı servisi profili oluşturulamadı. Kullanıcılar sayfasından «Kullanıcı oluştur» ile ekleyebilirsiniz."
                  });
                }
              } else {
                setResult(response);
              }
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
      <ResultPanel error={error} result={result} />
    </>
  );
}
