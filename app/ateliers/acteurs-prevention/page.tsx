export default function PreventionActorsWorkshop() {
  return (
    <main className="embedded-workshop-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE">
          <span className="brand-mark">CSE</span>
          <span>Les ateliers du CSE</span>
        </a>
        <a className="header-link" href="/">Tous les ateliers</a>
      </header>

      <section className="embedded-intro">
        <div>
          <p className="eyebrow">Atelier 02 · Jeu interactif</p>
          <h1>Les acteurs de la prévention</h1>
        </div>
        <div className="embedded-intro-copy">
          <p>Découvrez qui fait quoi en matière de santé, de sécurité et de prévention au travail.</p>
          <a href="/ateliers/acteurs-prevention/genially.html" target="_blank" rel="noreferrer">Ouvrir en plein écran ↗</a>
        </div>
      </section>

      <section className="genially-section" aria-label="Atelier interactif Les acteurs de la prévention">
        <iframe
          className="genially-frame"
          src="/ateliers/acteurs-prevention/genially.html"
          title="Les acteurs de la prévention — jeu Qui est-ce ?"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </section>

      <footer className="footer compact-footer">
        <div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div>
        <p>Atelier interactif intégré à votre espace de formation.</p>
        <a href="/">Retour aux ateliers ↑</a>
      </footer>
    </main>
  );
}
