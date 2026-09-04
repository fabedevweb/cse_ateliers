import type { Metadata } from 'next';
import ConsultationWorkshop, { ConsultationScenario } from '../../consultation-workshop';

export const metadata: Metadata = {
  title: 'Consultation CSE — L’Atelier des Arts',
  description: 'Cas pratique sur la mise à jour du DUERP d’une association de 35 salariés donnant des cours de musique.',
  openGraph: { title: 'Consultation CSE — L’Atelier des Arts', description: 'Analysez les risques d’une nouvelle salle de musique et rendez un avis motivé.', images: [] },
  twitter: { title: 'Consultation CSE — L’Atelier des Arts', description: 'Analysez les risques d’une nouvelle salle de musique et rendez un avis motivé.', images: [] },
};

const scenario: ConsultationScenario = {
  workshopNumber: '02',
  association: 'L’Atelier des Arts',
  workforce: '35 salariés',
  activity: 'Cours de piano, de musique et pratiques collectives',
  subject: 'Mise à jour annuelle du DUERP avant l’ouverture d’une nouvelle salle de cours louée',
  meeting: 'CSE ordinaire du 16 octobre 2026',
  heroTitle: 'Ouvrir une salle de musique sans fausse note.',
  heroIntro: 'Analysez les conditions d’accueil des enseignants et des élèves, puis rendez un avis motivé sur la mise à jour du DUERP.',
  caseTitle: 'Une nouvelle salle ouverte le soir et le samedi',
  situation: [
    'L’association loue une nouvelle salle pour les cours de piano, les répétitions collectives et l’accueil d’élèves, dont certains sont mineurs. Le lieu doit ouvrir dans six semaines. Les cours auront lieu jusqu’à 21 h 30 en semaine ainsi que le samedi.',
    'La direction prévoit des panneaux acoustiques, une consigne d’évacuation remise par le propriétaire et un téléphone partagé. Aucun mesurage du bruit n’a encore été réalisé. Le scénario d’évacuation n’a pas été testé avec les salariés, et certains professeurs devront fermer seuls les locaux. La livraison du piano est confiée à un prestataire, mais ses déplacements ultérieurs ne sont pas organisés.',
  ],
  riskCards: [
    { title: 'Bruit', level: 'À mesurer', text: 'Les cours individuels se succèdent et les répétitions collectives peuvent exposer durablement les enseignants à des niveaux sonores élevés.' },
    { title: 'Isolement et urgence', level: 'À préciser', text: 'Des salariés fermeront seuls le soir avec des élèves présents, sans dispositif d’alerte individuelle ni protocole détaillé.' },
    { title: 'Locaux et manutention', level: 'Incomplet', text: 'L’évacuation, l’accessibilité et les futurs déplacements du piano ne sont pas suffisamment évalués dans le dossier remis.' },
  ],
  debate: 'Peut-on rendre un avis favorable avant les mesures acoustiques et l’exercice d’évacuation ? Quelles mesures doivent être réalisées avant l’ouverture, puis suivies dans le temps ?',
  fileSlug: 'atelier-des-arts-nouvelle-salle',
};

export default function ArtsConsultationPage() {
  return <ConsultationWorkshop scenario={scenario} />;
}
