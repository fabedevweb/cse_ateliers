import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Escape game RPS — Les ateliers du CSE',
  description: 'Un escape game interactif consacré aux risques psychosociaux pour les formations CSE.',
  openGraph: { title: 'Escape game RPS — Les ateliers du CSE', description: 'Explorez les risques psychosociaux grâce à un parcours interactif.', images: [] },
  twitter: { title: 'Escape game RPS — Les ateliers du CSE', description: 'Explorez les risques psychosociaux grâce à un parcours interactif.', images: [] },
};

export default function RpsWorkshop() {
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
          <p className="eyebrow">Atelier 03 · Escape game interactif</p>
          <h1>RPS</h1>
        </div>
        <div className="embedded-intro-copy">
          <p>Explorez les risques psychosociaux à travers un parcours interactif à réaliser seul ou en équipe.</p>
          <a href="/ateliers/rps/genially.html" target="_blank" rel="noreferrer">Ouvrir en plein écran ↗</a>
        </div>
      </section>

      <section className="genially-section" aria-label="Escape game interactif sur les risques psychosociaux">
        <iframe
          className="genially-frame"
          src="/ateliers/rps/genially.html"
          title="Escape game RPS"
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
