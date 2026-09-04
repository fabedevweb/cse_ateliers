export default function ConsultationChoicePage() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
        <a className="header-link" href="/">Tous les ateliers</a>
      </header>
      <section className="home-hero compact-hero">
        <div><p className="eyebrow">Avis à rendre après consultation</p><h1>Deux scénarios, deux avis à construire.</h1></div>
        <p className="home-intro">Choisissez une situation, analysez la proposition de l’employeur avec le texte fourni, puis rédigez et téléchargez votre avis.</p>
      </section>
      <section className="workshop-library">
        <div className="workshop-cards two-cards">
          <a className="workshop-card lime" href="/ateliers/consultation-conges-payes">
            <div className="workshop-card-top"><span className="workshop-number">01</span><span className="workshop-type">Écoute &amp; Médiation · 15 salariés</span></div>
            <div className="workshop-card-body"><h3>Ordre des départs en congés payés</h3><p>Comparez six demandes de psychologues et examinez les critères de priorité proposés par la direction.</p></div>
            <div className="workshop-card-footer"><span>Ouvrir la consultation</span><strong aria-hidden="true">→</strong></div>
          </a>
          <a className="workshop-card warm" href="/ateliers/consultation-reclassement-inaptitude">
            <div className="workshop-card-top"><span className="workshop-number">02</span><span className="workshop-type">L’Atelier des Arts · 35 salariés</span></div>
            <div className="workshop-card-body"><h3>Reclassement après inaptitude</h3><p>Évaluez le poste d’enseignant-coordinateur proposé à Marc, professeur de piano depuis 12 ans.</p></div>
            <div className="workshop-card-footer"><span>Ouvrir la consultation</span><strong aria-hidden="true">→</strong></div>
          </a>
        </div>
      </section>
      <footer className="footer"><div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div><p>Deux situations, un même objectif : rendre un avis utile.</p><a href="/">Retour aux ateliers ↑</a></footer>
    </main>
  );
}
