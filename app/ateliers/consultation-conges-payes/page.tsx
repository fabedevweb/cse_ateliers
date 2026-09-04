import type { Metadata } from 'next';
import ConsultationWorkshop, { ConsultationScenario } from '../../consultation-workshop';

export const metadata: Metadata = {
  title: 'Consultation CSE — Ordre des départs en congés payés',
  description: 'Cas pratique pour rendre un avis sur l’ordre des départs en congés payés dans une association de 15 salariés.',
  openGraph: { title: 'Consultation CSE — Congés payés', description: 'Analysez l’ordre des départs proposé et rendez un avis motivé.', images: [] },
  twitter: { title: 'Consultation CSE — Congés payés', description: 'Analysez l’ordre des départs proposé et rendez un avis motivé.', images: [] },
};

export const scenario: ConsultationScenario = {
  workshopNumber: '01',
  association: 'Écoute & Médiation',
  workforce: '15 salariés',
  activity: 'Accompagnement des conflits professionnels, des risques psychosociaux et de la détresse psychologique',
  subject: 'Consultation sur l’ordre des départs en congés payés',
  heroTitle: 'Départager les congés de six psychologues.',
  heroIntro: 'Étudiez les demandes, confrontez les critères de la direction au Code du travail et rendez un avis motivé au nom du CSE.',
  caseTitle: 'Une permanence minimale à assurer pendant l’été',
  situation: [
    'L’association accompagne des entreprises confrontées à des situations de conflits professionnels, de risques psychosociaux et de détresse psychologique.',
    'Elle emploie notamment 9 psychologues, qui assurent des entretiens individuels, interviennent dans les entreprises clientes et peuvent être sollicités pour accompagner des dirigeants en situation de crise.',
    'La période de juillet et août est traditionnellement plus calme. Cependant, plusieurs entreprises clientes maintiennent leur activité et le directeur considère qu’une permanence minimale de trois psychologues doit être assurée en permanence.',
    'Cette année, les demandes de congés se concentrent fortement sur les mêmes périodes. Compte tenu des autres absences déjà programmées, toutes ces demandes ne peuvent pas être acceptées simultanément sans descendre sous le seuil de trois psychologues disponibles.',
  ],
  facts: [
    ['Effectif', '15 salariés'],
    ['Psychologues', '9'],
    ['Permanence minimale', '3 psychologues'],
    ['Objet', 'Ordre des départs en congés payés'],
  ],
  requestTable: {
    title: 'Les demandes reçues',
    headers: ['Salarié', 'Situation', 'Demande'],
    rows: [
      ['Claire', 'Psychologue, 11 ans d’ancienneté, 2 enfants de 7 et 10 ans', '3 semaines du 20 juillet au 9 août'],
      ['Nicolas', 'Psychologue, 8 ans d’ancienneté, sans enfant', '3 semaines du 20 juillet au 9 août'],
      ['Sarah', 'Psychologue, 4 ans d’ancienneté, 1 enfant de 5 ans ; conjoint dont l’entreprise ferme les 2 premières semaines d’août', '3 semaines du 27 juillet au 16 août'],
      ['Mehdi', 'Psychologue, 2 ans d’ancienneté, sans enfant ; travaille également comme psychologue pour une autre association', '2 semaines du 3 au 16 août'],
      ['Julie', 'Psychologue, 6 ans d’ancienneté, sans enfant', '3 semaines du 20 juillet au 9 août'],
      ['Thomas', 'Psychologue, 1 an d’ancienneté, 2 enfants adolescents', '3 semaines du 27 juillet au 16 août'],
    ],
  },
  proposal: {
    title: 'L’ancienneté comme critère principal',
    paragraphs: ['Pour départager les salariés, la direction considère que l’ancienneté doit être le critère principal « afin de récompenser la fidélité à l’association ». Elle propose l’ordre de priorité suivant :'],
    criteria: ['Ancienneté dans l’association', 'Présence d’enfants à charge', 'Date à laquelle la demande de congés a été déposée'],
    decisions: [
      'Accepter intégralement les demandes de Claire, Nicolas et Julie.',
      'Accorder à Sarah seulement deux semaines en août et déplacer sa troisième semaine en septembre.',
      'Reporter les deux semaines de Mehdi en septembre.',
      'Accorder à Thomas deux semaines en août et une semaine en octobre.',
    ],
  },
  analysisTitle: 'Trois critères à confronter à la proposition',
  analysisCards: [
    { title: 'Situation familiale', level: 'Critère légal', text: 'Il faut examiner les possibilités de congé du conjoint ou partenaire et la présence, au foyer, d’enfants ou d’une personne en situation de handicap ou de perte d’autonomie.' },
    { title: 'Ancienneté', level: 'Critère légal', text: 'La durée des services chez l’employeur fait partie des éléments à prendre en compte, sans être présentée par le texte comme automatiquement prioritaire.' },
    { title: 'Autre employeur', level: 'À examiner', text: 'L’activité de Mehdi auprès d’un autre employeur fait également partie des éléments expressément visés par l’article fourni.' },
  ],
  debate: 'L’ordre de priorité proposé et les arbitrages individuels tiennent-ils suffisamment compte de toutes les situations ? Quel ordre ou quelles réserves le CSE souhaite-t-il proposer ?',
  legalExplanation: 'À défaut de règles fixées par accord collectif, l’employeur définit l’ordre des départs après avis du CSE. Il tient notamment compte de la situation familiale, de la durée des services chez l’employeur et d’une éventuelle activité chez un ou plusieurs autres employeurs.',
  legalArticleLabel: 'Code du travail, article L. 3141-16',
  legalArticleUrl: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035652687',
  legalBasis: 'article L. 3141-16 du Code du travail',
  formPrompts: {
    informationLabel: 'Les informations sur les demandes et les contraintes sont-elles suffisantes ?',
    informationPlaceholder: 'Indiquez les informations disponibles et celles qui manquent pour comparer les situations…',
    findingsLabel: 'Comment analysez-vous les critères et l’ordre proposés ?',
    findingsPlaceholder: 'Appréciez la situation familiale, l’ancienneté, le multi-emploi et l’équité des arbitrages…',
    measuresLabel: 'Quel ordre, quelles adaptations ou quelles garanties proposez-vous ?',
    measuresPlaceholder: 'Formulez une proposition concrète ou les conditions auxquelles le CSE rend son avis…',
  },
  fileSlug: 'ecoute-mediation-conges-payes',
};

export default function PaidLeaveConsultationPage() {
  return <ConsultationWorkshop scenario={scenario} />;
}
