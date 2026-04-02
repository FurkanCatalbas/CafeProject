import { useState } from "react";
import { Input } from "../components/Input";
import { ResultPanel } from "../components/ResultPanel";
import { initialUserPayload } from "../formDefaults";
import { hataMesaji, parseUserIdQuery, safeInt } from "../errors";
import { useAsyncAction } from "../hooks/useAsyncAction";

export function UsersPage({
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
  const { run, result, setResult, error, setError, loading } = useAsyncAction(setGlobalError);

  const isAdmin = sessionInfo?.role === "ADMIN";

  function handleFetchById() {
    const parsed = parseUserIdQuery(userIdQuery);
    if (!parsed.ok) {
      const msg = hataMesaji(new Error(parsed.error));
      setError(msg);
      setGlobalError(msg);
      setResult(null);
      return;
    }
    run(async () => {
      const response = await getUserById(parsed.value, accessToken);
      setResult(response);
    });
  }

  return (
    <>
      <section className="hero hero-modern">
        <h1>Kullanıcı yönetimi</h1>
        <p>İşlemler ağ geçidi üzerinden kullanıcı servisine bağlanır.</p>
      </section>

      <section className="card card-elevated">
        <p className="card-subtitle" style={{ marginTop: 0 }}>
          Geçerli bir erişim jetonu gerekir (giriş veya kayıt sonrası).{" "}
          <small style={{ display: "block", marginTop: 8, opacity: 0.92, fontWeight: 400 }}>
            &quot;Kullanıcı ID ile getir&quot; <strong>kullanıcı servisindeki</strong> kayıt numarasıdır; ana sayfadaki oturum
            ID&apos;si (JWT) ile karıştırmayın — farklı veritabanlarıdır. Yeni kullanıcı oluşturduğunuzda ID alanı otomatik
            dolar.
          </small>
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
            disabled={!accessToken || !String(userIdQuery).trim() || loading}
            onClick={handleFetchById}
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
                id: userPayload.id ? safeInt(userPayload.id, undefined) : undefined,
                status: safeInt(userPayload.status, 1),
                type: safeInt(userPayload.type, 1)
              };
              const response = await createUser(payload, accessToken);
              setResult(response);
              if (response != null && response.id != null && response.id !== "") {
                const idStr = String(response.id);
                setUserIdQuery(idStr);
                setUserPayload((s) => ({ ...s, id: idStr }));
              }
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
                    id: safeInt(userPayload.id, NaN),
                    status: safeInt(userPayload.status, 1),
                    type: safeInt(userPayload.type, 1)
                  };
                  if (!Number.isFinite(payload.id)) {
                    throw new Error("VALIDATION:Güncelleme için geçerli bir kullanıcı ID’si girin.");
                  }
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
                  const delId = safeInt(userPayload.id, NaN);
                  if (!Number.isFinite(delId)) {
                    throw new Error("VALIDATION:Silme için geçerli bir kullanıcı ID’si girin.");
                  }
                  const response = await deleteUser(delId, accessToken);
                  setResult(response || { mesaj: "Silindi" });
                })
              }
            >
              Sil (yalnızca ADMIN)
            </button>
          </div>
        </form>
      </section>

      <ResultPanel error={error} result={result} />
    </>
  );
}
