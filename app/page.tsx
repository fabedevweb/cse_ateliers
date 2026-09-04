const workshops = [
  {
    number: '01',
    type: 'Consultation · Psychologie',
    title: 'Prévenir les risques psychosociaux',
    description: 'Une association de 15 salariés crée une permanence pour intervenir lors de conflits entre équipes et auprès de dirigeants.',
    meta: '35 à 45 min · Travail en groupe',
    href: '/ateliers/consultation-psychologues',
    accent: 'lime',
  },
  {
    number: '02',
    type: 'Consultation · Musique',
    title: 'Ouvrir une nouvelle salle de cours',
    description: 'L’Atelier des Arts, 35 salariés, prépare l’ouverture d’une salle louée pour ses cours de piano et de musique.',
    meta: '35 à 45 min · Travail en groupe',
    href: '/ateliers/consultation-atelier-des-arts',
    accent: 'warm',
  },
  {
    number: '03',
    type: 'Jeu interactif',
    title: 'Les acteurs de la prévention',
    description: 'Identifiez les différents acteurs de la prévention grâce à un parcours « Qui est-ce ? » interactif.',
    meta: 'Parcours Genially · En équipe',
    href: '/ateliers/acteurs-prevention',
    accent: 'blue',
  },
];

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Les ateliers du CSE, accueil">
          <span className="brand-mark">CSE</span>
          <span>Les ateliers du CSE</span>
        </a>
        <a className="header-link" href="#ateliers">Voir les ateliers</a>
      </header>

      <section className="home-hero">
        <div>
          <p className="eyebrow">Formation CSE · Ressources pratiques</p>
          <h1>Apprendre en faisant,<br />atelier après atelier.</h1>
        </div>
        <p className="home-intro">Des activités simples à ouvrir pendant vos formations pour faire réfléchir, débattre et produire les élus du CSE.</p>
      </section>

      <section className="workshop-library" id="ateliers">
        <div className="library-heading">
          <div>
            <p className="eyebrow">La bibliothèque</p>
            <h2>Choisissez un atelier</h2>
          </div>
          <p>Chaque carte ouvre directement l’activité. De nouveaux ateliers pourront être ajoutés ici au fil de vos formations.</p>
        </div>

        <div className="workshop-cards">
          {workshops.map((workshop) => (
            <a className={`workshop-card ${workshop.accent}`} href={workshop.href} key={workshop.number}>
              <div className="workshop-card-top">
                <span className="workshop-number">{workshop.number}</span>
                <span className="workshop-type">{workshop.type}</span>
              </div>
              <div className="workshop-card-body">
                <h3>{workshop.title}</h3>
                <p>{workshop.description}</p>
              </div>
              <div className="workshop-card-footer">
                <span>{workshop.meta}</span>
                <strong aria-hidden="true">→</strong>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div>
        <p>Un outil pédagogique simple pour apprendre en faisant.</p>
        <a href="#top">Retour en haut ↑</a>
      </footer>
    </main>
  );
}
