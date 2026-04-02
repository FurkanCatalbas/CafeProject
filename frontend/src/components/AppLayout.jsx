import { Link } from "react-router-dom";

export function AppLayout({ sessionInfo, onLogout, globalError, children }) {
  return (
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
        {globalError ? <div className="banner-error">{globalError}</div> : null}
        {children}
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} CafeProject — Kahve, bağlantı ve kolay yönetim.</p>
      </footer>
    </div>
  );
}
