// Listes métier de l'atelier « Enquête AT/MP ». Reprises du module d'enquête
// du cockpit CSE, qui suit la trame ITAMAMI : Individu, Tâche et activité,
// Matériel, Milieu. Les listes qui y étaient alimentées par la base du
// cockpit (établissements, unités de travail, élus) deviennent des champs
// libres, l'atelier n'ayant ni entreprise ni annuaire.

export type EventType =
  | 'Accident du travail'
  | 'Accident de trajet'
  | 'Maladie professionnelle'
  | 'Incident'
  | 'Presqu’accident';

export const eventTypes: EventType[] = [
  'Accident du travail',
  'Accident de trajet',
  'Maladie professionnelle',
  'Incident',
  'Presqu’accident',
];

export const externalHelpOptions = [
  'Cabinet médical',
  'Hôpital / CHU / Clinique',
  'SAMU / SMUR',
  'Autre',
];

export const scheduleOptions = ['Journée', 'Matin', 'Après-midi', 'Nuit'];

// Formations dont la date se coche une par une : elles reviennent dans
// presque toutes les enquêtes et leur absence est en elle-même un fait.
export const fixedTrainings = [
  'Formation au poste de travail',
  'Formation renforcée pour les intérimaires',
  'Formation préparatoire à l’habilitation électrique',
  'Formation pontier',
  'Formation à la conduite de chariots de manutention',
  'Formation à la conduite de nacelles',
];

export const epiOptions = [
  'Gants',
  'Gants anti-coupure',
  'Lunettes de sécurité',
  'Chaussures de sécurité',
  'Vêtements de travail',
  'Casque',
  'Harnais de sécurité',
  'Protections auditives',
];

export const nuisanceOptions = ['Bruit', 'Éclairage', 'Poussières', 'Vibrations', 'Chaleur ou froid', 'Autre'];

export const consequenceTypes = [
  'Incident matériel sans blessé',
  'Accident déclaré sans arrêt',
  'Accident déclaré avec arrêt',
  'Maladie professionnelle déclarée',
  'Incapacité permanente',
  'Décès',
];

export const injuryOptions = [
  'Coupure',
  'Amputation',
  'Plaie superficielle',
  'Plaie profonde',
  'Douleur musculaire',
  'Pincement',
  'Irritation oculaire',
  'Brûlure superficielle',
  'Écrasement',
  'Entorse',
  'Fracture',
  'Brûlure étendue',
  'Irritation cutanée',
  'Intoxication',
  'Symptômes liés au stress',
  'Électrisation',
  'Électrocution',
  'Décès',
  'Autre',
];

export const itamamiLetters = [
  { code: 'I', label: 'Individu', hint: 'Qui était là, avec quelle expérience et quelles formations ?', step: 2 },
  { code: 'T/A', label: 'Tâche et activité', hint: 'Que faisait réellement la personne à ce moment-là ?', step: 3 },
  { code: 'Ma', label: 'Matériel', hint: 'Avec quels équipements, produits et protections ?', step: 4 },
  { code: 'Mi', label: 'Milieu', hint: 'Dans quel environnement, avec quelles nuisances ?', step: 5 },
];

export const steps: [string, string, string][] = [
  ['01', 'Cadrer', 'Événement et secours'],
  ['02', 'Individu', 'Qui — I'],
  ['03', 'Tâche', 'Quoi — T/A'],
  ['04', 'Matériel', 'Avec quoi — Ma'],
  ['05', 'Milieu', 'Où — Mi'],
  ['06', 'Conséquences', 'Gravité et lésions'],
  ['07', 'Faits', 'Récit et témoins'],
  ['08', 'Relier', 'Arbre des causes'],
];
