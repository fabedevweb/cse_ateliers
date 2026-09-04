import type { Metadata } from 'next';
import ConsultationWorkshop, { ConsultationScenario } from '../../consultation-workshop';

export const metadata: Metadata = {
  title: 'Consultation CSE — Reclassement après inaptitude',
  description: 'Cas pratique pour rendre un avis sur le reclassement d’un professeur de piano déclaré inapte.',
  openGraph: { title: 'Consultation CSE — Reclassement après inaptitude', description: 'Analysez le poste proposé à Marc et rendez un avis motivé.', images: [] },
  twitter: { title: 'Consultation CSE — Reclassement après inaptitude', description: 'Analysez le poste proposé à Marc et rendez un avis motivé.', images: [] },
};

export const scenario: ConsultationScenario = {
  workshopNumber: '02',
  association: 'L’Atelier des Arts',
  workforce: '35 salariés',
  activity: 'Cours de piano, guitare, violon, chant et éveil musical',
  subject: 'Consultation sur le reclassement du professeur de piano devenu inapte',
  heroTitle: 'Évaluer le reclassement proposé à Marc.',
  heroIntro: 'Comparez le contenu du nouveau poste aux indications du médecin du travail, puis rendez un avis motivé au nom du CSE.',
  caseTitle: 'Un poste d’enseignant-coordinateur pédagogique',
  situation: [
    'L’association de 35 salariés dispense des cours de piano, guitare, violon, chant et éveil musical.',
    'Marc, professeur de piano depuis 12 ans, est déclaré inapte à son poste dans ses conditions actuelles. Le médecin du travail indique qu’il pourrait exercer une activité ne nécessitant ni maintien prolongé en position assise ni pratique intensive et répétée du piano.',
    'L’employeur envisage un poste d’enseignant-coordinateur pédagogique de 24 heures. Le salaire serait maintenu et des aménagements ergonomiques seraient réalisés.',
  ],
  facts: [
    ['Effectif', '35 salariés'],
    ['Ancienneté de Marc', '12 ans'],
    ['Poste proposé', '24 heures'],
    ['Salaire', 'Maintenu'],
  ],
  proposal: {
    title: 'La répartition des 24 heures proposées',
    paragraphs: ['Le poste d’enseignant-coordinateur pédagogique serait composé de :'],
    decisions: [
      '8 heures de piano.',
      '6 heures d’éveil et de culture musicale.',
      '4 heures de préparation de projets.',
      '4 heures de coordination.',
      '2 heures d’accueil.',
      'Des aménagements ergonomiques seraient réalisés.',
    ],
  },
  analysisTitle: 'Trois dimensions à vérifier avant l’avis',
  analysisCards: [
    { title: 'Indications médicales', level: 'Point de départ', text: 'Le poste doit être étudié au regard de l’absence de maintien prolongé en position assise et de pratique intensive et répétée du piano.' },
    { title: 'Contenu réel du poste', level: 'À apprécier', text: 'La répartition des 24 heures doit être confrontée aux gestes, postures, rythmes et possibilités d’alternance réellement prévus.' },
    { title: 'Aménagements et suivi', level: 'À préciser', text: 'Les aménagements ergonomiques annoncés, leur calendrier et les modalités de suivi de la reprise doivent être suffisamment concrets.' },
  ],
  debate: 'Les 8 heures de piano et l’organisation globale du poste sont-elles compatibles avec les indications du médecin du travail ? Quelles précisions ou adaptations demander avant de rendre l’avis ?',
  legalExplanation: 'Lorsqu’un salarié est déclaré inapte, l’employeur lui propose un autre emploi approprié à ses capacités après avis du CSE. La proposition doit tenir compte des conclusions écrites et des indications du médecin du travail.',
  legalArticleLabel: 'Code du travail, article L. 1226-2',
  legalArticleUrl: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035653236',
  legalBasis: 'article L. 1226-2 du Code du travail',
  formPrompts: {
    informationLabel: 'Les informations remises permettent-elles d’évaluer le reclassement ?',
    informationPlaceholder: 'Indiquez les précisions disponibles ou manquantes sur les tâches, postures, horaires et aménagements…',
    findingsLabel: 'Le poste paraît-il compatible avec les indications médicales ?',
    findingsPlaceholder: 'Analysez notamment les 8 heures de piano, l’alternance des tâches et les conditions concrètes du poste…',
    measuresLabel: 'Quelles adaptations ou garanties demandez-vous à l’employeur ?',
    measuresPlaceholder: 'Précisez les aménagements, limites, étapes de suivi ou vérifications que le CSE souhaite demander…',
  },
  fileSlug: 'atelier-des-arts-reclassement-marc',
};

export default function ReassignmentConsultationPage() {
  return <ConsultationWorkshop scenario={scenario} />;
}
