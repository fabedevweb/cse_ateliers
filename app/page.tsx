const workshops = [
  {
    number: '01',
    type: '2 scénarios',
    title: 'Avis à rendre après consultation',
    description: 'Choisissez entre l’ordre des départs en congés payés et le reclassement d’un professeur de piano déclaré inapte.',
    meta: 'Deux associations · Avis PDF',
    href: '/ateliers/avis-duerp',
    accent: 'lime',
  },
  {
    number: '02',
    type: 'Jeu interactif',
    title: 'Les acteurs de la prévention',
    description: 'Identifiez les différents acteurs de la prévention grâce à un parcours « Qui est-ce ? » interactif.',
    meta: 'Parcours Genially · En équipe',
    href: '/ateliers/acteurs-prevention',
    accent: 'blue',
  },
  {
    number: '03',
    type: 'Escape game interactif',
    title: 'RPS',
    description: 'Explorez les risques psychosociaux à travers un escape game interactif à utiliser pendant vos formations.',
    meta: 'Parcours Genially · En équipe',
    href: '/ateliers/rps',
    accent: 'warm',
  },
  {
    number: '04',
    type: 'Outil guidé · 2027',
    title: 'Préparer une inspection',
    description: 'Planifiez votre prochaine inspection, consignez les observations du terrain et produisez un rapport professionnel pour la direction.',
    meta: 'Avant · Pendant · Après · Rapport PDF',
    href: '/ateliers/inspection',
    accent: 'inspection',
  },
  {
    number: '05',
    type: 'Atelier guidé · DUERP',
    title: 'Analyse différenciée & DUERP-CSE',
    description: 'Analysez une situation de travail en tenant compte des expositions des femmes et des hommes, puis rédigez votre proposition de document unique.',
    meta: '5 étapes · Cotation · Rapport PDF',
    href: '/ateliers/duerp-analyse-differenciee',
    accent: 'duerp',
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

        <div className="workshop-cards five-cards">
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
