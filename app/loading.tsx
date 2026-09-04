export default function Loading() {
  return (
    <div className="page-loader visible">
      <div className="page-loader-spinner" aria-hidden="true" />
      <p role="status" aria-live="polite">Chargement de l’atelier…</p>
    </div>
  );
}
