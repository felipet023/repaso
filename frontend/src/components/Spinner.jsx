export default function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="state-block">
      <div className="spinner" aria-label={label} />
      <p>{label}</p>
    </div>
  );
}
