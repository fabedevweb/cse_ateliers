export default function ConsultationChoicePage() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
        <a className="header-link" href="/">Tous les ateliers</a>
      </header>
      <section className="home-hero compact-hero">
        <div><p className="eyebrow">Consultations CSE</p><h1>Choisissez votre situation.</h1></div>
        <p className="home-intro">Deux cas adaptés à deux activités associatives différentes, avec un avis motivé à produire.</p>
      </section>
      <section className="workshop-library">
        <div className="workshop-cards two-cards">
          <a className="workshop-card lime" href="/ateliers/consultation-psychologues">
            <div className="workshop-card-top"><span className="workshop-number">01</span><span className="workshop-type">15 salariés</span></div>
            <div className="workshop-card-body"><h3>Association de psychologues</h3><p>Prévenir la charge émotionnelle, le travail isolé et les effets d’une permanence d’urgence.</p></div>
            <div className="workshop-card-footer"><span>Ouvrir la consultation</span><strong aria-hidden="true">→</strong></div>
          </a>
          <a className="workshop-card warm" href="/ateliers/consultation-atelier-des-arts">
            <div className="workshop-card-top"><span className="workshop-number">02</span><span className="workshop-type">35 salariés</span></div>
            <div className="workshop-card-body"><h3>L’Atelier des Arts</h3><p>Évaluer les risques avant l’ouverture d’une nouvelle salle de cours de piano et de musique.</p></div>
            <div className="workshop-card-footer"><span>Ouvrir la consultation</span><strong aria-hidden="true">→</strong></div>
          </a>
        </div>
      </section>
      <footer className="footer"><div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div><p>Deux situations, un même objectif : rendre un avis utile.</p><a href="/">Retour aux ateliers ↑</a></footer>
    </main>
  );
}
