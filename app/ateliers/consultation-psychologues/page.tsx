import type { Metadata } from 'next';
import ConsultationWorkshop, { ConsultationScenario } from '../../consultation-workshop';

export const metadata: Metadata = {
  title: 'Consultation CSE — Association de psychologues',
  description: 'Cas pratique sur la mise à jour du DUERP d’une association de 15 salariés intervenant dans des situations de conflit.',
  openGraph: { title: 'Consultation CSE — Association de psychologues', description: 'Analysez les risques psychosociaux et rendez un avis motivé.', images: [] },
  twitter: { title: 'Consultation CSE — Association de psychologues', description: 'Analysez les risques psychosociaux et rendez un avis motivé.', images: [] },
};

const scenario: ConsultationScenario = {
  workshopNumber: '01',
  association: 'Association Horizon Psy',
  workforce: '15 salariés',
  activity: 'Psychologie du travail, médiation et accompagnement de dirigeants',
  subject: 'Mise à jour annuelle du DUERP et des actions de prévention des risques psychosociaux',
  meeting: 'CSE ordinaire du 9 octobre 2026',
  heroTitle: 'Protéger celles et ceux qui apaisent les conflits.',
  heroIntro: 'Étudiez une organisation d’interventions sensibles, repérez les risques psychosociaux et rendez un avis argumenté sur le DUERP actualisé.',
  caseTitle: 'Une permanence d’urgence pour les conflits',
  situation: [
    'L’association accompagne des équipes en conflit et des cadres dirigeants confrontés à des situations professionnelles sensibles. Face à une hausse des demandes urgentes, la direction veut créer une permanence tournante de 18 h à 22 h, deux soirs par semaine, avec possibilité d’intervention à distance ou sur site dès le lendemain.',
    'La mise à jour du DUERP mentionne la charge émotionnelle et le travail isolé. La direction propose un débriefing collectif mensuel et une formation en ligne de deux heures. Elle ne précise toutefois ni le nombre maximal de dossiers simultanés, ni les temps de récupération après une intervention tardive, ni la procédure d’alerte lorsqu’un psychologue se sent en difficulté.',
  ],
  riskCards: [
    { title: 'Charge émotionnelle', level: 'Élevé', text: 'Les salariés reçoivent des récits de conflits intenses et peuvent être exposés à l’agressivité ou à la détresse de leurs interlocuteurs.' },
    { title: 'Travail isolé', level: 'À encadrer', text: 'Certaines interventions auprès de dirigeants sont menées seul, sans binôme ni procédure claire d’appui immédiat.' },
    { title: 'Temps de travail', level: 'Incomplet', text: 'Les permanences du soir, les déplacements et les temps de récupération ne sont pas précisément organisés ni suivis.' },
  ],
  debate: 'Le débriefing mensuel et la formation suffisent-ils ? Quelles limites de charge, garanties de récupération et possibilités d’alerte devraient figurer dans les actions de prévention ?',
  fileSlug: 'horizon-psy-risques-psychosociaux',
};

export default function PsychologistsConsultationPage() {
  return <ConsultationWorkshop scenario={scenario} />;
}
