export function ResultPanel({ error, result }) {
  return (
    <section className="card card-elevated">
      <h2>Sonuç</h2>
      {error ? (
        <pre className="error">{error}</pre>
      ) : (
        <pre>
          {result != null ? (
            JSON.stringify(result, null, 2)
          ) : (
            <span className="empty-result">Henüz sonuç yok.</span>
          )}
        </pre>
      )}
    </section>
  );
}
