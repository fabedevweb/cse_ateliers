'use client';

/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages */

import { useEffect, useMemo, useState } from 'react';

type EventType = 'Accident du travail' | 'Accident de trajet' | 'Maladie professionnelle' | 'Presqu’accident';
type CauseNature = 'Humaine' | 'Organisationnelle' | 'Technique';
type NodeType = 'Fait variable' | 'Fait permanent' | 'Fait de base';

type Witness = { id: string; name: string; role: string; statement: string };
type Fact = {
  id: string;
  description: string;
  nature: CauseNature;
  nodeType: NodeType;
  actionable: boolean;
  parentId: string;
};

type InvestigationData = {
  eventType: EventType;
  company: string;
  accidentDate: string;
  accidentTime: string;
  investigators: string;
  cseInvestigation: boolean;
  firstAidBy: string;
  firstAid: string;
  externalHelp: string;
  victimName: string;
  victimAge: string;
  victimJob: string;
  victimPosition: string;
  victimTenure: string;
  victimSchedule: string;
  victimTraining: string;
  lastMedicalVisit: string;
  usualTask: string;
  equipment: string;
  products: string;
  fdsChecked: string;
  epis: string[];
  otherEpi: string;
  collectiveProtection: string;
  sector: string;
  subSector: string;
  usualWorkstation: boolean;
  floorCondition: string;
  cluttered: boolean;
  levelDifferences: boolean;
  nuisances: string;
  lightingOk: boolean;
  consequenceType: string;
  daysOff: string;
  injuryLocation: string;
  injuryNature: string;
  narrative: string;
  harmfulEvent: string;
};

const STORAGE_KEY = 'cse-enquete-atmp-v1';
const DAMAGE_ID = 'fait-dommageable';
const makeId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const blankWitness = (): Witness => ({ id: makeId(), name: '', role: '', statement: '' });
const blankFact = (): Fact => ({ id: makeId(), description: '', nature: 'Organisationnelle', nodeType: 'Fait variable', actionable: false, parentId: DAMAGE_ID });

const initialData: InvestigationData = {
  eventType: 'Accident du travail', company: '', accidentDate: '', accidentTime: '', investigators: '', cseInvestigation: true,
  firstAidBy: '', firstAid: '', externalHelp: '', victimName: '', victimAge: '', victimJob: '', victimPosition: '', victimTenure: '', victimSchedule: 'Journée', victimTraining: '', lastMedicalVisit: '',
  usualTask: '', equipment: '', products: '', fdsChecked: 'Non concerné', epis: [], otherEpi: '', collectiveProtection: '',
  sector: '', subSector: '', usualWorkstation: true, floorCondition: '', cluttered: false, levelDifferences: false, nuisances: '', lightingOk: true,
  consequenceType: 'Accident déclaré sans arrêt', daysOff: '', injuryLocation: '', injuryNature: '', narrative: '', harmfulEvent: '',
};

const exampleData: InvestigationData = {
  eventType: 'Accident du travail', company: 'Imprimerie Horizon', accidentDate: '2026-03-12', accidentTime: '10:20', investigators: 'Lina Morel, élue CSE\nMarc Roy, responsable production', cseInvestigation: true,
  firstAidBy: 'Sauveteur secouriste du travail de l’atelier', firstAid: 'Nettoyage de la plaie, pansement compressif puis mise au repos.', externalHelp: 'Consultation aux urgences organisée par l’entreprise.',
  victimName: 'Camille Martin', victimAge: '34', victimJob: 'Conductrice de ligne', victimPosition: 'Massicot industriel M4', victimTenure: '8 mois au poste', victimSchedule: 'Matin', victimTraining: 'Accueil sécurité et formation au poste il y a 7 mois.', lastMedicalVisit: '2025-11-18',
  usualTask: 'Régler le massicot, positionner les piles de papier, lancer la coupe puis évacuer les formats. Le nettoyage des chutes se fait normalement machine arrêtée, outil consigné et carter fermé.',
  equipment: 'Massicot M4, poussoir arrière et bac de récupération des chutes.', products: '', fdsChecked: 'Non concerné', epis: ['Chaussures de sécurité', 'Gants anti-coupure'], otherEpi: '', collectiveProtection: 'Carter mobile avec interverrouillage.',
  sector: 'Atelier de façonnage', subSector: 'Ligne M4', usualWorkstation: true, floorCondition: 'Sol sec et dégagé.', cluttered: false, levelDifferences: false, nuisances: 'Bruit ambiant et cadence élevée en fin de série.', lightingOk: true,
  consequenceType: 'Accident déclaré avec arrêt', daysOff: '12', injuryLocation: 'Index de la main gauche', injuryNature: 'Plaie profonde',
  narrative: 'À 10 h 20, une chute de papier reste coincée près de la lame. La production accuse du retard. Camille ouvre le carter et retire la chute sans couper l’alimentation générale. Le poussoir se remet en mouvement pendant que sa main se trouve dans la zone dangereuse. Son index heurte une arête métallique.',
  harmfulEvent: 'L’index gauche heurte une arête du massicot en mouvement, provoquant une plaie profonde.',
};

const exampleFacts: Fact[] = [
  { id: 'ex-1', description: 'La main se trouve dans la zone dangereuse lorsque le poussoir redémarre.', nature: 'Humaine', nodeType: 'Fait variable', actionable: false, parentId: DAMAGE_ID },
  { id: 'ex-2', description: 'Le carter est ouvert sans coupure de l’alimentation générale.', nature: 'Technique', nodeType: 'Fait variable', actionable: false, parentId: 'ex-1' },
  { id: 'ex-3', description: 'Une chute de papier est coincée près de la lame.', nature: 'Technique', nodeType: 'Fait variable', actionable: false, parentId: 'ex-1' },
  { id: 'ex-4', description: 'La procédure de débourrage ne prévoit pas de point de consignation accessible.', nature: 'Organisationnelle', nodeType: 'Fait de base', actionable: true, parentId: 'ex-2' },
  { id: 'ex-5', description: 'Le dispositif d’interverrouillage n’empêche pas le mouvement du poussoir.', nature: 'Technique', nodeType: 'Fait de base', actionable: true, parentId: 'ex-2' },
  { id: 'ex-6', description: 'Le retard de production conduit l’équipe à écourter les arrêts de ligne.', nature: 'Organisationnelle', nodeType: 'Fait permanent', actionable: true, parentId: 'ex-3' },
];

const epiOptions = ['Gants anti-coupure', 'Lunettes', 'Chaussures de sécurité', 'Vêtements de travail', 'Casque', 'Harnais', 'Protection auditive'];
const steps = [
  ['01', 'Cadrer', 'Événement et équipe'],
  ['02', 'Recueillir', 'Victime et témoins'],
  ['03', 'Décrire', 'Travail réel'],
  ['04', 'Établir', 'Récit et faits'],
  ['05', 'Relier', 'Arbre des causes'],
];

const formatDate = (value: string) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`)) : 'Non renseignée';
const short = (value: string, max = 160) => value.trim().length > max ? `${value.trim().slice(0, max - 1)}…` : value.trim() || 'Non renseigné';

export default function InvestigationWorkshop() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<InvestigationData>(initialData);
  const [witnesses, setWitnesses] = useState<Witness[]>([blankWitness()]);
  const [facts, setFacts] = useState<Fact[]>([blankFact()]);
  const [hydrated, setHydrated] = useState(false);
  const [savedLabel, setSavedLabel] = useState('Sauvegarde locale active');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { data?: InvestigationData; witnesses?: Witness[]; facts?: Fact[]; step?: number };
        if (parsed.data) setData({ ...initialData, ...parsed.data });
        if (parsed.witnesses?.length) setWitnesses(parsed.witnesses);
        if (parsed.facts?.length) setFacts(parsed.facts);
        if (parsed.step && parsed.step >= 1 && parsed.step <= 5) setStep(parsed.step);
      }
    } catch {
      setSavedLabel('Sauvegarde indisponible');
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, witnesses, facts, step }));
        setSavedLabel('Enregistré sur cet appareil');
      } catch {
        setSavedLabel('Sauvegarde indisponible');
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [data, witnesses, facts, step, hydrated]);

  const usableWitnesses = useMemo(() => witnesses.filter((item) => item.name.trim() || item.statement.trim()), [witnesses]);
  const usableFacts = useMemo(() => facts.filter((item) => item.description.trim()), [facts]);
  const rootCauses = useMemo(() => usableFacts.filter((item) => item.actionable || item.nodeType === 'Fait de base'), [usableFacts]);
  const completion = useMemo(() => [data.company, data.accidentDate, data.victimName, data.victimPosition, data.usualTask, data.narrative, data.harmfulEvent, usableFacts.length ? 'faits' : ''].filter(Boolean).length, [data, usableFacts]);

  const updateData = <K extends keyof InvestigationData>(key: K, value: InvestigationData[K]) => setData((current) => ({ ...current, [key]: value }));
  const updateWitness = (id: string, key: keyof Witness, value: string) => setWitnesses((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const updateFact = <K extends keyof Fact>(id: string, key: K, value: Fact[K]) => setFacts((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const removeFact = (id: string) => setFacts((current) => current.filter((item) => item.id !== id).map((item) => item.parentId === id ? { ...item, parentId: DAMAGE_ID } : item));
  const toggleEpi = (value: string) => updateData('epis', data.epis.includes(value) ? data.epis.filter((item) => item !== value) : [...data.epis, value]);

  const loadExample = () => {
    setData(exampleData);
    setWitnesses([{ id: makeId(), name: 'Noah Bernard', role: 'Aide-conducteur', statement: 'Il confirme le redémarrage du poussoir après l’ouverture du carter.' }]);
    setFacts(exampleFacts);
    setStep(1);
  };

  const resetWorkshop = () => {
    if (!window.confirm('Effacer le brouillon enregistré sur cet appareil ?')) return;
    setData(initialData);
    setWitnesses([blankWitness()]);
    setFacts([blankFact()]);
    setStep(1);
    localStorage.removeItem(STORAGE_KEY);
  };

  const downloadPowerPoint = async () => {
    setIsExporting(true);
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'Les ateliers du CSE';
      pptx.subject = 'Rapport d’enquête après un accident du travail ou une maladie professionnelle';
      pptx.title = `Enquête ${data.eventType} — ${data.company || 'CSE'}`;
      pptx.company = data.company || 'CSE';
      pptx.lang = 'fr-FR';
      pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'fr-FR' };
      pptx.defineSlideMaster({
        title: 'REPORT',
        background: { color: 'F4F6F2' },
        objects: [
          { rect: { x: 0, y: 0, w: 13.333, h: 0.18, fill: { color: 'DFF16A' }, line: { color: 'DFF16A' } } },
          { text: { text: 'LES ATELIERS DU CSE', options: { x: 0.6, y: 7.05, w: 4.6, h: 0.18, fontFace: 'Aptos', fontSize: 7, bold: true, color: '52655D', charSpacing: 1.2, margin: 0 } } },
          { text: { text: 'Rapport d’enquête AT/MP', options: { x: 9.2, y: 7.05, w: 3.5, h: 0.18, fontFace: 'Aptos', fontSize: 7, color: '52655D', align: 'right', margin: 0 } } },
        ],
        slideNumber: { x: 12.78, y: 7.05, w: 0.22, h: 0.18, fontFace: 'Aptos', fontSize: 7, color: '52655D', align: 'right', margin: 0 },
      });

      const addTitle = (slide: InstanceType<typeof PptxGenJS>['addSlide'] extends (...args: never[]) => infer R ? R : never, title: string, kicker: string) => {
        slide.addText(kicker.toUpperCase(), { x: 0.65, y: 0.55, w: 4.5, h: 0.26, fontSize: 8, bold: true, color: '176F52', charSpacing: 1.4, margin: 0 });
        slide.addText(title, { x: 0.65, y: 0.92, w: 11.9, h: 0.56, fontSize: 28, bold: false, color: '16342B', margin: 0, breakLine: false, fit: 'shrink' });
      };
      const addSection = (slide: ReturnType<typeof pptx.addSlide>, title: string, body: string, x: number, y: number, w: number, h: number) => {
        slide.addText(title.toUpperCase(), { x, y, w, h: 0.22, fontSize: 8, bold: true, color: '176F52', charSpacing: 1.1, margin: 0 });
        slide.addText(body.trim() || 'Non renseigné', { x, y: y + 0.32, w, h: h - 0.32, fontSize: 15, color: '30483F', valign: 'top', margin: 0.02, breakLine: false, fit: 'shrink' });
      };

      const cover = pptx.addSlide('REPORT');
      cover.background = { color: '16342B' };
      cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.22, h: 7.5, fill: { color: 'DFF16A' }, line: { color: 'DFF16A' } });
      cover.addText('COMITÉ SOCIAL ET ÉCONOMIQUE', { x: 0.85, y: 0.8, w: 5.8, h: 0.3, fontSize: 10, bold: true, color: 'DFF16A', charSpacing: 1.6, margin: 0 });
      cover.addText('Rapport d’enquête\nAT/MP', { x: 0.85, y: 1.45, w: 8.4, h: 1.55, fontSize: 36, color: 'FFFFFF', bold: false, breakLine: false, margin: 0, fit: 'shrink' });
      cover.addText(data.eventType, { x: 0.88, y: 3.35, w: 5.8, h: 0.4, fontSize: 18, bold: true, color: 'FFFFFF', margin: 0 });
      cover.addText(`${data.company || 'Entreprise non renseignée'}\n${formatDate(data.accidentDate)}${data.accidentTime ? ` à ${data.accidentTime}` : ''}`, { x: 0.88, y: 3.92, w: 6.4, h: 0.9, fontSize: 16, color: 'D4E0DB', breakLine: false, margin: 0.01, fit: 'shrink' });
      cover.addText('Document de travail à valider collectivement avant diffusion', { x: 0.88, y: 6.45, w: 6.6, h: 0.28, fontSize: 9, color: 'B7C8C1', margin: 0 });
      cover.addShape(pptx.ShapeType.ellipse, { x: 9.65, y: 1.1, w: 2.15, h: 2.15, fill: { color: 'DFF16A', transparency: 8 }, line: { color: 'DFF16A' } });
      cover.addText('CSE', { x: 9.65, y: 1.83, w: 2.15, h: 0.5, fontSize: 27, bold: true, color: '16342B', align: 'center', margin: 0 });

      const framing = pptx.addSlide('REPORT');
      addTitle(framing, 'Cadre de l’enquête', '01 · Identification');
      addSection(framing, 'Entreprise', data.company, 0.65, 1.85, 3.7, 1.15);
      addSection(framing, 'Événement', `${data.eventType}\n${formatDate(data.accidentDate)}${data.accidentTime ? ` à ${data.accidentTime}` : ''}`, 4.65, 1.85, 3.8, 1.15);
      addSection(framing, 'Lieu', [data.sector, data.subSector].filter(Boolean).join(' — '), 8.75, 1.85, 3.9, 1.15);
      addSection(framing, 'Enquêteurs', data.investigators, 0.65, 3.55, 5.7, 1.85);
      addSection(framing, 'Victime', `${data.victimName || 'Non renseignée'}\n${data.victimJob || data.victimPosition || ''}\nAncienneté : ${data.victimTenure || 'non renseignée'}`, 6.7, 3.55, 5.95, 1.85);

      const work = pptx.addSlide('REPORT');
      addTitle(work, 'Travail réel et environnement', '02 · Recueil des faits');
      addSection(work, 'Tâche habituelle', data.usualTask, 0.65, 1.75, 5.8, 2.05);
      addSection(work, 'Matériels et protections', `Équipements : ${data.equipment || 'non renseignés'}\nEPI : ${[...data.epis, data.otherEpi].filter(Boolean).join(', ') || 'non renseignés'}\nEPC : ${data.collectiveProtection || 'non renseignés'}`, 6.8, 1.75, 5.85, 2.05);
      addSection(work, 'Milieu', `Sol : ${data.floorCondition || 'non renseigné'}\nEncombrement : ${data.cluttered ? 'oui' : 'non'}\nDifférences de niveau : ${data.levelDifferences ? 'oui' : 'non'}\nÉclairage satisfaisant : ${data.lightingOk ? 'oui' : 'non'}\nNuisances : ${data.nuisances || 'non renseignées'}`, 0.65, 4.25, 5.8, 1.65);
      addSection(work, 'Éléments recueillis', `Témoins : ${usableWitnesses.map((item) => item.name).join(', ') || 'aucun renseigné'}\nPremiers soins : ${data.firstAid || 'non renseignés'}\nSecours extérieurs : ${data.externalHelp || 'non renseignés'}`, 6.8, 4.25, 5.85, 1.65);

      const story = pptx.addSlide('REPORT');
      addTitle(story, 'Déroulement et conséquences', '03 · Reconstitution');
      addSection(story, 'Récit objectif', data.narrative, 0.65, 1.7, 8.1, 3.95);
      addSection(story, 'Conséquences', `${data.consequenceType}\n${data.daysOff ? `${data.daysOff} jour(s) d’arrêt` : ''}\n${data.injuryLocation}\n${data.injuryNature}`, 9.15, 1.7, 3.5, 1.75);
      addSection(story, 'Fait dommageable', data.harmfulEvent, 9.15, 4.0, 3.5, 1.65);

      const factChunks = usableFacts.length ? Array.from({ length: Math.ceil(usableFacts.length / 7) }, (_, index) => usableFacts.slice(index * 7, index * 7 + 7)) : [[]];
      factChunks.forEach((chunk, chunkIndex) => {
        const slide = pptx.addSlide('REPORT');
        addTitle(slide, `Faits établis${factChunks.length > 1 ? ` (${chunkIndex + 1}/${factChunks.length})` : ''}`, '04 · Analyse');
        if (!chunk.length) slide.addText('Aucun fait renseigné.', { x: 0.7, y: 2, w: 11.8, h: 0.5, fontSize: 18, color: '52655D', margin: 0 });
        chunk.forEach((fact, index) => {
          const y = 1.68 + index * 0.7;
          const color = fact.nature === 'Organisationnelle' ? '6B3FA0' : fact.nature === 'Technique' ? '2463A6' : 'A24135';
          slide.addText(`${chunkIndex * 7 + index + 1}`.padStart(2, '0'), { x: 0.68, y, w: 0.42, h: 0.28, fontSize: 10, bold: true, color, margin: 0 });
          slide.addText(fact.description, { x: 1.25, y: y - 0.04, w: 8.6, h: 0.42, fontSize: 13, color: '243C33', margin: 0, breakLine: false, fit: 'shrink' });
          slide.addText(`${fact.nature} · ${fact.nodeType}${fact.actionable ? ' · actionnable' : ''}`, { x: 10.1, y, w: 2.5, h: 0.28, fontSize: 8, bold: true, color, align: 'right', margin: 0, fit: 'shrink' });
          slide.addShape(pptx.ShapeType.line, { x: 0.68, y: y + 0.48, w: 11.95, h: 0, line: { color: 'D7DFDA', width: 0.7 } });
        });
      });

      const tree = pptx.addSlide('REPORT');
      addTitle(tree, 'Arbre des causes', '05 · Enchaînement causal');
      tree.addText(short(data.harmfulEvent, 150), { x: 4.45, y: 1.62, w: 4.45, h: 0.82, fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'mid', fill: { color: 'A43D31' }, line: { color: 'A43D31' }, margin: 0.08, fit: 'shrink' });
      const shownFacts = usableFacts.slice(0, 10);
      const levels = new Map<string, number>([[DAMAGE_ID, 0]]);
      shownFacts.forEach((fact) => levels.set(fact.id, (levels.get(fact.parentId) ?? 0) + 1));
      const maxLevel = Math.max(1, ...Array.from(levels.values()));
      const grouped = Array.from({ length: maxLevel }, (_, level) => shownFacts.filter((fact) => levels.get(fact.id) === level + 1));
      const positions = new Map<string, { x: number; y: number; w: number; h: number }>([[DAMAGE_ID, { x: 4.45, y: 1.62, w: 4.45, h: 0.82 }]]);
      grouped.forEach((group, levelIndex) => {
        const available = 11.95;
        const gap = 0.18;
        const width = Math.min(3.35, (available - gap * Math.max(0, group.length - 1)) / Math.max(1, group.length));
        const start = 0.68 + (available - (group.length * width + Math.max(0, group.length - 1) * gap)) / 2;
        group.forEach((fact, index) => positions.set(fact.id, { x: start + index * (width + gap), y: 2.95 + levelIndex * 1.15, w: width, h: 0.78 }));
      });
      shownFacts.forEach((fact) => {
        const pos = positions.get(fact.id);
        const parent = positions.get(fact.parentId) || positions.get(DAMAGE_ID);
        if (!pos || !parent) return;
        tree.addShape(pptx.ShapeType.line, { x: pos.x + pos.w / 2, y: pos.y, w: parent.x + parent.w / 2 - (pos.x + pos.w / 2), h: parent.y + parent.h - pos.y, line: { color: '84978F', width: 1.15, beginArrowType: 'none', endArrowType: 'triangle' } });
      });
      shownFacts.forEach((fact) => {
        const pos = positions.get(fact.id);
        if (!pos) return;
        const fill = fact.nodeType === 'Fait de base' ? 'DDF0DF' : fact.nodeType === 'Fait permanent' ? 'DCEAF6' : 'FFF2BF';
        const line = fact.nodeType === 'Fait de base' ? '4D8B55' : fact.nodeType === 'Fait permanent' ? '3672A8' : 'C99B24';
        tree.addText(short(fact.description, 95), { ...pos, fontSize: 9.5, bold: fact.actionable, color: '243C33', align: 'center', valign: 'mid', fill: { color: fill }, line: { color: line, width: fact.actionable ? 1.7 : 1 }, margin: 0.06, fit: 'shrink' });
      });
      tree.addText('Variable : situation inhabituelle     Permanent : condition habituelle     Fait de base : levier de prévention', { x: 0.68, y: 6.62, w: 11.9, h: 0.25, fontSize: 8, color: '52655D', align: 'center', margin: 0 });

      const roots = pptx.addSlide('REPORT');
      addTitle(roots, 'Causes racines à examiner', '06 · Prévention');
      if (!rootCauses.length) {
        roots.addText('Aucune cause racine marquée comme actionnable. Reprenez l’arbre avec le groupe avant de diffuser le rapport.', { x: 0.7, y: 2, w: 11.8, h: 0.7, fontSize: 19, color: '52655D', margin: 0 });
      } else {
        rootCauses.slice(0, 6).forEach((fact, index) => {
          roots.addText(`${index + 1}`.padStart(2, '0'), { x: 0.72, y: 1.75 + index * 0.78, w: 0.5, h: 0.3, fontSize: 11, bold: true, color: '176F52', margin: 0 });
          roots.addText(fact.description, { x: 1.35, y: 1.7 + index * 0.78, w: 10.9, h: 0.48, fontSize: 15, color: '243C33', margin: 0, breakLine: false, fit: 'shrink' });
        });
      }
      roots.addText('L’arbre des causes constitue une hypothèse de travail. Le CSE valide les liens à partir des faits vérifiés et complète ensuite les mesures de prévention.', { x: 0.72, y: 6.3, w: 11.9, h: 0.5, fontSize: 10, italic: true, color: '52655D', margin: 0 });

      await pptx.writeFile({ fileName: `rapport-enquete-${(data.company || 'cse').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.pptx` });
    } catch (error) {
      window.alert(`Le rapport PowerPoint n’a pas pu être créé. ${error instanceof Error ? error.message : 'Veuillez réessayer.'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="investigation-page">
      <header className="site-header investigation-site-header">
        <a className="brand" href="/"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
        <a className="header-link" href="/">← Tous les ateliers</a>
      </header>

      <section className="investigation-hero">
        <div>
          <p className="eyebrow">Atelier 07 · Enquête AT/MP</p>
          <h1>Comprendre les faits,<br />construire l’arbre.</h1>
          <p>Un parcours inspiré de la méthode INRS pour recueillir des faits vérifiables, remonter aux causes et préparer un compte rendu collectif.</p>
        </div>
        <aside className="investigation-hero-note">
          <span>Principe de méthode</span>
          <strong>On recherche des causes, jamais un coupable.</strong>
          <p>Les informations restent dans le navigateur. Pour la formation, utilisez de préférence un cas fictif ou anonymisé.</p>
          <div><button type="button" onClick={loadExample}>Charger le cas d’exemple</button><button type="button" onClick={resetWorkshop}>Recommencer</button></div>
        </aside>
      </section>

      <nav className="investigation-steps" aria-label="Étapes de l’enquête">
        {steps.map(([number, title, subtitle], index) => {
          const itemStep = index + 1;
          return <button type="button" key={number} className={step === itemStep ? 'active' : step > itemStep ? 'done' : ''} onClick={() => setStep(itemStep)}><span>{step > itemStep ? '✓' : number}</span><small>{subtitle}</small><strong>{title}</strong></button>;
        })}
        <p>{savedLabel}</p>
      </nav>

      <section className="investigation-workspace">
        <div className="investigation-stage-heading">
          <div><p className="eyebrow">Étape {step} sur 5</p><h2>{steps[step - 1][1]}</h2></div>
          <span>{completion}/8 repères essentiels renseignés</span>
        </div>

        {step === 1 && <div className="investigation-stage">
          <div className="investigation-panel">
            <h3>Événement et cadre de l’enquête</h3>
            <div className="investigation-choice-grid four">
              {(['Accident du travail', 'Accident de trajet', 'Maladie professionnelle', 'Presqu’accident'] as EventType[]).map((value) => <button type="button" key={value} className={data.eventType === value ? 'selected' : ''} onClick={() => updateData('eventType', value)}>{value}</button>)}
            </div>
            <div className="investigation-form-grid two">
              <label>Raison sociale<input value={data.company} onChange={(event) => updateData('company', event.target.value)} placeholder="Nom de l’entreprise" /></label>
              <label>Enquêteurs<textarea rows={3} value={data.investigators} onChange={(event) => updateData('investigators', event.target.value)} placeholder="Nom et rôle de chaque enquêteur" /></label>
              <label>Date de l’événement<input type="date" value={data.accidentDate} onChange={(event) => updateData('accidentDate', event.target.value)} /></label>
              <label>Heure<input type="time" value={data.accidentTime} onChange={(event) => updateData('accidentTime', event.target.value)} /></label>
            </div>
            <label className="investigation-toggle"><input type="checkbox" checked={data.cseInvestigation} onChange={(event) => updateData('cseInvestigation', event.target.checked)} /><span>Les représentants du personnel participent à l’enquête</span></label>
          </div>
          <StageActions step={step} setStep={setStep} />
        </div>}

        {step === 2 && <div className="investigation-stage">
          <div className="investigation-panel">
            <h3>Victime et situation professionnelle</h3>
            <div className="investigation-form-grid three">
              <label>Nom ou identifiant anonymisé<input value={data.victimName} onChange={(event) => updateData('victimName', event.target.value)} placeholder="Ex. Salarié A" /></label>
              <label>Âge<input inputMode="numeric" value={data.victimAge} onChange={(event) => updateData('victimAge', event.target.value)} placeholder="34" /></label>
              <label>Profession<input value={data.victimJob} onChange={(event) => updateData('victimJob', event.target.value)} placeholder="Conductrice de ligne" /></label>
              <label>Poste au moment de l’événement<input value={data.victimPosition} onChange={(event) => updateData('victimPosition', event.target.value)} /></label>
              <label>Ancienneté au poste<input value={data.victimTenure} onChange={(event) => updateData('victimTenure', event.target.value)} placeholder="8 mois" /></label>
              <label>Horaire<select value={data.victimSchedule} onChange={(event) => updateData('victimSchedule', event.target.value)}><option>Journée</option><option>Matin</option><option>Après-midi</option><option>Nuit</option></select></label>
              <label className="wide">Formations et compétences<textarea rows={3} value={data.victimTraining} onChange={(event) => updateData('victimTraining', event.target.value)} placeholder="Formation au poste, habilitations, dates connues…" /></label>
              <label>Dernière visite médicale<input type="date" value={data.lastMedicalVisit} onChange={(event) => updateData('lastMedicalVisit', event.target.value)} /></label>
            </div>
          </div>
          <div className="investigation-panel">
            <div className="panel-heading"><div><h3>Témoins et secours</h3><p>Consignez des déclarations factuelles. Distinguez ce qui a été vu, entendu ou rapporté.</p></div><button type="button" onClick={() => setWitnesses((current) => [...current, blankWitness()])}>+ Ajouter un témoin</button></div>
            <div className="witness-list">{witnesses.map((witness, index) => <div className="witness-card" key={witness.id}><span>0{index + 1}</span><label>Nom<input value={witness.name} onChange={(event) => updateWitness(witness.id, 'name', event.target.value)} /></label><label>Poste ou rôle<input value={witness.role} onChange={(event) => updateWitness(witness.id, 'role', event.target.value)} /></label><label className="wide">Déclaration<textarea rows={3} value={witness.statement} onChange={(event) => updateWitness(witness.id, 'statement', event.target.value)} /></label><button type="button" disabled={witnesses.length === 1} onClick={() => setWitnesses((current) => current.filter((item) => item.id !== witness.id))}>Retirer</button></div>)}</div>
            <div className="investigation-form-grid three">
              <label>Premiers soins donnés par<input value={data.firstAidBy} onChange={(event) => updateData('firstAidBy', event.target.value)} /></label>
              <label>Soins réalisés<input value={data.firstAid} onChange={(event) => updateData('firstAid', event.target.value)} /></label>
              <label>Secours extérieurs<input value={data.externalHelp} onChange={(event) => updateData('externalHelp', event.target.value)} /></label>
            </div>
          </div>
          <StageActions step={step} setStep={setStep} />
        </div>}

        {step === 3 && <div className="investigation-stage">
          <div className="investigation-method"><strong>I · T/A · Ma · Mi</strong><p>Individu, tâche ou activité, matériels et milieu : décrivez la situation habituelle pour repérer ensuite ce qui a changé.</p></div>
          <div className="investigation-panel">
            <h3>Tâche et activité</h3>
            <label>Travail réalisé habituellement<textarea rows={6} value={data.usualTask} onChange={(event) => updateData('usualTask', event.target.value)} placeholder="Objectif, étapes, fréquence, coordination, consignes et écarts possibles…" /></label>
          </div>
          <div className="investigation-grid two-panels">
            <div className="investigation-panel"><h3>Matériels</h3><label>Équipements de travail<textarea rows={3} value={data.equipment} onChange={(event) => updateData('equipment', event.target.value)} /></label><label>Produits utilisés<input value={data.products} onChange={(event) => updateData('products', event.target.value)} /></label>{data.products && <label>FDS consultée<select value={data.fdsChecked} onChange={(event) => updateData('fdsChecked', event.target.value)}><option>Oui</option><option>Non</option><option>Non concerné</option></select></label>}<p className="field-title">EPI portés</p><div className="investigation-check-grid">{epiOptions.map((item) => <label key={item} className={data.epis.includes(item) ? 'selected' : ''}><input type="checkbox" checked={data.epis.includes(item)} onChange={() => toggleEpi(item)} />{item}</label>)}</div><label>Autres EPI<input value={data.otherEpi} onChange={(event) => updateData('otherEpi', event.target.value)} /></label><label>Protections collectives<input value={data.collectiveProtection} onChange={(event) => updateData('collectiveProtection', event.target.value)} /></label></div>
            <div className="investigation-panel"><h3>Milieu</h3><label>Secteur<input value={data.sector} onChange={(event) => updateData('sector', event.target.value)} /></label><label>Sous-secteur ou machine<input value={data.subSector} onChange={(event) => updateData('subSector', event.target.value)} /></label><label>État du sol<input value={data.floorCondition} onChange={(event) => updateData('floorCondition', event.target.value)} /></label><label>Nuisances<textarea rows={3} value={data.nuisances} onChange={(event) => updateData('nuisances', event.target.value)} /></label><div className="investigation-switches"><label><input type="checkbox" checked={data.usualWorkstation} onChange={(event) => updateData('usualWorkstation', event.target.checked)} />Poste habituel</label><label><input type="checkbox" checked={data.cluttered} onChange={(event) => updateData('cluttered', event.target.checked)} />Poste encombré</label><label><input type="checkbox" checked={data.levelDifferences} onChange={(event) => updateData('levelDifferences', event.target.checked)} />Différences de niveau</label><label><input type="checkbox" checked={data.lightingOk} onChange={(event) => updateData('lightingOk', event.target.checked)} />Éclairage satisfaisant</label></div></div>
          </div>
          <StageActions step={step} setStep={setStep} />
        </div>}

        {step === 4 && <div className="investigation-stage">
          <div className="investigation-grid two-panels">
            <div className="investigation-panel"><h3>Conséquences</h3><label>Type<select value={data.consequenceType} onChange={(event) => updateData('consequenceType', event.target.value)}><option>Incident matériel sans blessé</option><option>Accident déclaré sans arrêt</option><option>Accident déclaré avec arrêt</option><option>Incapacité permanente</option><option>Décès</option></select></label><label>Nombre de jours d’arrêt<input inputMode="numeric" value={data.daysOff} onChange={(event) => updateData('daysOff', event.target.value)} /></label><label>Partie du corps atteinte<input value={data.injuryLocation} onChange={(event) => updateData('injuryLocation', event.target.value)} /></label><label>Nature de la lésion<input value={data.injuryNature} onChange={(event) => updateData('injuryNature', event.target.value)} /></label></div>
            <div className="investigation-panel"><h3>Reconstitution</h3><p className="panel-copy">Écrivez uniquement ce qui peut être observé ou vérifié. Remplacez « il n’a pas fait attention » par une description précise du geste et de la situation.</p><label>Récit chronologique<textarea rows={10} value={data.narrative} onChange={(event) => updateData('narrative', event.target.value)} placeholder="De la situation normale jusqu’aux conséquences…" /></label><label>Fait dommageable<textarea rows={3} value={data.harmfulEvent} onChange={(event) => updateData('harmfulEvent', event.target.value)} placeholder="Contact, chute, exposition ou mouvement ayant produit le dommage…" /></label></div>
          </div>
          <div className="investigation-panel">
            <div className="panel-heading"><div><h3>Liste des faits établis</h3><p>Ajoutez les faits à rebours du dommage : causes directes d’abord, puis antécédents.</p></div><button type="button" onClick={() => setFacts((current) => [...current, blankFact()])}>+ Ajouter un fait</button></div>
            <div className="fact-list">{facts.map((fact, index) => <div className="fact-card" key={fact.id}><div className="fact-card-head"><span>Fait {String(index + 1).padStart(2, '0')}</span><button type="button" disabled={facts.length === 1} onClick={() => removeFact(fact.id)}>Retirer</button></div><label>Description factuelle<textarea rows={3} value={fact.description} onChange={(event) => updateFact(fact.id, 'description', event.target.value)} /></label><div className="investigation-form-grid three"><label>Nature<select value={fact.nature} onChange={(event) => updateFact(fact.id, 'nature', event.target.value as CauseNature)}><option>Humaine</option><option>Organisationnelle</option><option>Technique</option></select></label><label>Statut dans l’arbre<select value={fact.nodeType} onChange={(event) => updateFact(fact.id, 'nodeType', event.target.value as NodeType)}><option>Fait variable</option><option>Fait permanent</option><option>Fait de base</option></select></label><label className="fact-action"><input type="checkbox" checked={fact.actionable} onChange={(event) => updateFact(fact.id, 'actionable', event.target.checked)} />Levier de prévention actionnable</label></div></div>)}</div>
          </div>
          <StageActions step={step} setStep={setStep} />
        </div>}

        {step === 5 && <div className="investigation-stage">
          <div className="tree-instructions"><div><strong>Question à poser pour chaque lien</strong><p>« Pour que ce fait arrive, qu’a-t-il fallu ? » Reliez chaque cause au fait qu’elle explique. Plusieurs causes peuvent être nécessaires ensemble.</p></div><span>{usableFacts.length} fait(s) · {rootCauses.length} levier(s)</span></div>
          <div className="investigation-panel relation-panel">
            <div className="harmful-node"><small>Fait dommageable</small><strong>{data.harmfulEvent || 'À renseigner à l’étape 4'}</strong></div>
            {!usableFacts.length && <p className="empty-tree">Ajoutez au moins un fait à l’étape précédente pour construire l’arbre.</p>}
            {usableFacts.map((fact, index) => <div className="relation-row" key={fact.id}><span className={`nature-dot ${fact.nature.toLowerCase()}`}>{fact.nature.charAt(0)}</span><div><strong>{fact.description}</strong><small>{fact.nodeType}{fact.actionable ? ' · actionnable' : ''}</small></div><label>Ce fait était nécessaire pour<select value={fact.parentId} onChange={(event) => updateFact(fact.id, 'parentId', event.target.value)}><option value={DAMAGE_ID}>Le fait dommageable</option>{usableFacts.slice(0, index).map((candidate, candidateIndex) => <option value={candidate.id} key={candidate.id}>Fait {candidateIndex + 1} · {short(candidate.description, 55)}</option>)}</select></label></div>)}
          </div>
          <CauseTree facts={usableFacts} harmfulEvent={data.harmfulEvent} />
          <div className="report-action-panel investigation-report-panel"><div><p className="eyebrow">Rapport de séance</p><h3>Votre enquête au format PowerPoint</h3><p>Le fichier reprend le cadrage, le travail réel, le récit, les faits, l’arbre des causes et les causes racines à examiner. Tous les éléments restent modifiables dans PowerPoint.</p></div><button className="button" type="button" disabled={isExporting} onClick={downloadPowerPoint}>{isExporting ? 'Préparation du fichier…' : 'Télécharger le rapport .pptx'}</button></div>
          <StageActions step={step} setStep={setStep} />
        </div>}
      </section>
    </main>
  );
}

function StageActions({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  return <div className="investigation-stage-actions"><button type="button" className="text-button" disabled={step === 1} onClick={() => setStep(Math.max(1, step - 1))}>← Étape précédente</button>{step < 5 && <button type="button" className="button" onClick={() => setStep(Math.min(5, step + 1))}>Continuer</button>}</div>;
}

function CauseTree({ facts, harmfulEvent }: { facts: Fact[]; harmfulEvent: string }) {
  const renderChildren = (parentId: string, depth = 0): React.ReactNode => {
    const children = facts.filter((fact) => fact.parentId === parentId);
    if (!children.length) return null;
    return <div className="cause-branches">{children.map((fact) => <div className="cause-branch" key={fact.id}><div className={`cause-node ${fact.nodeType.toLowerCase().replaceAll(' ', '-')} ${fact.actionable ? 'actionable' : ''}`}><small>{fact.nature} · {fact.nodeType}</small><strong>{fact.description}</strong>{fact.actionable && <span>Levier de prévention</span>}</div>{depth < 8 && renderChildren(fact.id, depth + 1)}</div>)}</div>;
  };
  return <div className="cause-tree"><div className="cause-tree-heading"><div><p className="eyebrow">Résultat de l’atelier</p><h3>Arbre des causes</h3></div><div className="tree-legend"><span className="variable">Variable</span><span className="permanent">Permanent</span><span className="base">Fait de base</span></div></div><div className="cause-tree-canvas"><div className="cause-node damage"><small>Fait dommageable</small><strong>{harmfulEvent || 'Fait dommageable à préciser'}</strong></div>{renderChildren(DAMAGE_ID)}</div></div>;
}
