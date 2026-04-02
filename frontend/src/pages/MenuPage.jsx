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

export function MenuPage() {
  return (
    <>
      <section className="hero hero-modern">
        <h1>İmza menümüz</h1>
        <p>Örnek fiyatlar ve açıklamalar; sipariş entegrasyonu ileride eklenecek.</p>
      </section>
      <section className="menu-grid">
        <MenuCard emoji="☕" name="Espresso" description="Yoğun gövde, dengeli ekstraksiyon." price="85 ₺" />
        <MenuCard
          emoji="🥛"
          name="Cappuccino"
          description="İki shot espresso ve ipeksi süt köpüğü."
          price="110 ₺"
        />
        <MenuCard emoji="🧊" name="Cold Brew" description="Soğuk demleme, yumuşak ve ferahlatıcı." price="120 ₺" />
        <MenuCard emoji="🍵" name="Matcha Latte" description="Kremalı yeşil çay ve mikroköpük." price="125 ₺" />
      </section>
    </>
  );
}
