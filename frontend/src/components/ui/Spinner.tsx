export function Spinner({ large }: { large?: boolean }) {
  return <span className={large ? 'spinner spinner-lg' : 'spinner'} />;
}

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Spinner large />
      <p style={{ color: 'var(--slate-400)', fontSize: 'var(--font-sm)' }}>Carregando…</p>
    </div>
  );
}
