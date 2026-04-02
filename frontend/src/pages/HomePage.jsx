export function HomePage({ sessionInfo }) {
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
            <p className="card-subtitle" style={{ margin: "12px 0 0", fontSize: "0.9rem", lineHeight: 1.45 }}>
              Bu numara <strong>giriş (auth) servisindeki</strong> kullanıcı kaydını ifade eder.{" "}
              <strong>Kullanıcılar</strong> sayfasındaki &quot;Kullanıcı ID ile getir&quot; ise{" "}
              <strong>kullanıcı servisi</strong> veritabanına bakar — aynı sayı olmayabilir veya o
              serviste hiç kayıt olmayabilir. Orada aramak için önce &quot;Kullanıcı oluştur&quot; ile
              kayıt açın veya Sonuç’taki ID’yi kullanın.
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
