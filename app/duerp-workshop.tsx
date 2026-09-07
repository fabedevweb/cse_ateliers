'use client';

import { useEffect, useMemo, useState } from 'react';

type WorkshopMeta = { unit: string; job: string };

type RiskDraft = {
  activity: string;
  source: string;
  nature: string;
  family: string;
  analysisElements: string;
  danger: string;
  fearedEvent: string;
  probability: string;
  probabilityArgument: string;
  gravity: string;
  gravityArgument: string;
  measures: string;
};

type RiskRecord = RiskDraft & {
  id: string;
  riskNo: string;
  unit: string;
  job: string;
  brut: number;
  mastery: number;
  residual: number;
};

type PrincipleDecision = 'retained' | 'not-retained' | '';
type PrincipleAnswer = { decision: PrincipleDecision; note: string };

type ActionPlan = {
  riskId: string;
  principles: Record<number, PrincipleAnswer>;
  action: string;
  priority: string;
  responsible: string;
  due: string;
  means: string;
  implementationIndicator: string;
  successIndicator: string;
};

type MainStep = 1 | 2 | 3 | 4;

const STORAGE_KEY = 'cse-duerp-pedagogique-v2';
const initialMeta: WorkshopMeta = { unit: '', job: '' };
const initialDraft: RiskDraft = {
  activity: '', source: 'Analyse CSE', nature: 'Nouveau risque proposé par le CSE', family: '',
  analysisElements: '', danger: '', fearedEvent: '', probability: '', probabilityArgument: '', gravity: '',
  gravityArgument: '', measures: '',
};

const riskFamilies = [
  'Chutes de plain-pied', 'Chutes de hauteur', 'Circulations et déplacements internes', 'Risque routier en mission',
  'Activité physique et manutention manuelle', 'Manutention mécanique', 'Risque chimique (produits, émissions, poussières)',
  'Agents biologiques', 'Équipements de travail et machines', 'Effondrements et chutes d’objets', 'Bruit',
  'Ambiances thermiques', 'Incendie et explosion', 'Risque électrique', 'Éclairage et ambiances lumineuses',
  'Rayonnements', 'Risques psychosociaux', 'Vibrations', 'Travail sur écran', 'Travail isolé',
  'Coactivité et entreprises extérieures', 'Pratiques addictives', 'Violences sexistes et sexuelles au travail (VSST)',
  'Autre risque',
];

const probabilityOptions = [
  ['1', 'F1 · Très peu probable — exceptionnel'],
  ['2', 'F2 · Peu probable — peut survenir une fois par an'],
  ['3', 'F3 · Probable — occasionnel ou mensuel'],
  ['4', 'F4 · Très probable — régulier ou hebdomadaire'],
];
const gravityOptions = [
  ['1', 'G1 · Faible — atteinte bénigne ou sans arrêt'],
  ['2', 'G2 · Moyenne — arrêt et dommages réversibles'],
  ['3', 'G3 · Grave — dommages irréversibles'],
  ['4', 'G4 · Très grave — dommages importants ou décès'],
];

const riskQuestions = [
  { title: 'Décrire le travail réel', prompt: 'Quelle situation, quel poste ou quelle activité expose au risque ?', field: 'activity' },
  { title: 'Identifier l’origine', prompt: 'Comment ce risque a-t-il été repéré ?', field: 'source' },
  { title: 'Situer la proposition', prompt: 'Quel lien cette analyse entretient-elle avec le DUERP de l’employeur ?', field: 'nature' },
  { title: 'Nommer le risque', prompt: 'À quelle famille de risque cette situation appartient-elle ?', field: 'family' },
  { title: 'Rassembler les éléments', prompt: 'Quels faits, observations ou échanges permettent d’étayer cette analyse ?', field: 'analysisElements' },
  { title: 'Repérer le danger', prompt: 'Quelle est la source possible du dommage ou la situation dangereuse ?', field: 'danger' },
  { title: 'Anticiper le dommage', prompt: 'Quel évènement redouté pourrait se produire ?', field: 'fearedEvent' },
  { title: 'Coter la probabilité', prompt: 'À quelle fréquence ce dommage peut-il survenir ?', field: 'probability' },
  { title: 'Coter la gravité', prompt: 'Quelle serait la gravité du dommage ?', field: 'gravity' },
  { title: 'Évaluer la maîtrise', prompt: 'Quelles mesures de prévention sont déjà réellement en place ?', field: 'measures' },
] as const;

const principles = [
  { id: 1, title: 'Éviter les risques', question: 'La situation dangereuse, l’exposition ou la tâche peut-elle être supprimée ?' },
  { id: 2, title: 'Évaluer les risques qui ne peuvent pas être évités', question: 'La cotation réalisée permet-elle de dimensionner et de prioriser l’action proposée ?' },
  { id: 3, title: 'Combattre les risques à la source', question: 'L’action modifie-t-elle directement la cause, le procédé, le matériel ou l’organisation à l’origine du risque ?' },
  { id: 4, title: 'Adapter le travail à l’être humain', question: 'Comment adapter le poste, les objectifs, les rythmes ou les méthodes au travail réel ?' },
  { id: 5, title: 'Tenir compte de l’évolution de la technique', question: 'Une solution technique plus sûre, plus ergonomique ou mieux adaptée est-elle disponible ?' },
  { id: 6, title: 'Remplacer ce qui est dangereux par ce qui ne l’est pas ou l’est moins', question: 'Peut-on substituer le produit, l’équipement, le procédé, la tâche ou le mode d’organisation dangereux ?' },
  { id: 7, title: 'Planifier la prévention', question: 'La mesure articule-t-elle technique, organisation, conditions de travail, calendrier, moyens et suivi ?' },
  { id: 8, title: 'Donner la priorité à la protection collective', question: 'La proposition protège-t-elle toutes les personnes exposées avant de dépendre d’un comportement ou d’un EPI ?' },
  { id: 9, title: 'Donner les instructions appropriées aux travailleurs', question: 'Quelles consignes sont nécessaires pour accompagner la transformation sans constituer l’unique mesure ?' },
] as const;

const makeId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const splitMeasures = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const masteryFromMeasures = (value: string) => {
  const count = splitMeasures(value).length;
  if (count === 0) return 1;
  if (count < 3) return 0.75;
  if (count < 5) return 0.5;
  return 0.25;
};
const masteryLabel = (value: number) => value === 1 ? 'Aucune maîtrise' : value === 0.75 ? 'Maîtrise faible' : value === 0.5 ? 'Maîtrise partielle' : 'Maîtrise forte';
const roundOne = (value: number) => Math.round(value * 10) / 10;
const levelFor = (score: number) => score <= 1 ? 'Faible' : score <= 3 ? 'Modéré' : score <= 8 ? 'Élevé' : 'Critique';
const levelClass = (score: number) => score <= 1 ? 'low' : score <= 3 ? 'medium' : score <= 8 ? 'high' : 'critical';
const formatNumber = (value: number | string) => String(value || '—').replace('.', ',');
const emptyPrinciples = () => Object.fromEntries(principles.map((principle) => [principle.id, { decision: '', note: '' }])) as Record<number, PrincipleAnswer>;
const newActionPlan = (riskId = ''): ActionPlan => ({
  riskId, principles: emptyPrinciples(), action: '', priority: '', responsible: '', due: '', means: '',
  implementationIndicator: '', successIndicator: '',
});

export default function DuerpWorkshop() {
  const [step, setStep] = useState<MainStep>(1);
  const [riskQuestion, setRiskQuestion] = useState(0);
  const [principleQuestion, setPrincipleQuestion] = useState(0);
  const [meta, setMeta] = useState<WorkshopMeta>(initialMeta);
  const [draft, setDraft] = useState<RiskDraft>(initialDraft);
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [planDraft, setPlanDraft] = useState<ActionPlan>(newActionPlan());
  const [editingId, setEditingId] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [savedLabel, setSavedLabel] = useState('Sauvegarde locale active');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          meta?: WorkshopMeta; draft?: RiskDraft; risks?: RiskRecord[]; plans?: ActionPlan[]; planDraft?: ActionPlan;
          step?: MainStep; riskQuestion?: number; principleQuestion?: number; editingId?: string;
        };
        if (parsed.meta) setMeta({ ...initialMeta, ...parsed.meta });
        if (parsed.draft) setDraft({ ...initialDraft, ...parsed.draft });
        if (Array.isArray(parsed.risks)) setRisks(parsed.risks);
        if (Array.isArray(parsed.plans)) setPlans(parsed.plans);
        if (parsed.planDraft) setPlanDraft({ ...newActionPlan(parsed.planDraft.riskId), ...parsed.planDraft, principles: { ...emptyPrinciples(), ...parsed.planDraft.principles } });
        if (parsed.step) setStep(parsed.step);
        if (Number.isInteger(parsed.riskQuestion)) setRiskQuestion(Math.max(0, Math.min(riskQuestions.length - 1, parsed.riskQuestion || 0)));
        if (Number.isInteger(parsed.principleQuestion)) setPrincipleQuestion(Math.max(0, Math.min(principles.length, parsed.principleQuestion || 0)));
        if (parsed.editingId) setEditingId(parsed.editingId);
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta, draft, risks, plans, planDraft, step, riskQuestion, principleQuestion, editingId }));
        setSavedLabel('Enregistré sur cet appareil');
      } catch {
        setSavedLabel('Sauvegarde indisponible');
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [meta, draft, risks, plans, planDraft, step, riskQuestion, principleQuestion, editingId, hydrated]);

  const score = useMemo(() => {
    const probability = Number(draft.probability);
    const gravity = Number(draft.gravity);
    const mastery = masteryFromMeasures(draft.measures);
    const brut = probability && gravity ? roundOne(probability * gravity) : 0;
    return { brut, mastery, residual: brut ? roundOne(brut * mastery) : 0 };
  }, [draft.probability, draft.gravity, draft.measures]);

  const nextRiskNumber = useMemo(() => {
    const max = risks.reduce((highest, risk) => Math.max(highest, Number(risk.riskNo.match(/\d+/)?.[0] || 0)), 0);
    return `R-${String(max + 1).padStart(3, '0')}`;
  }, [risks]);

  const currentRiskNumber = risks.find((risk) => risk.id === editingId)?.riskNo || nextRiskNumber;
  const planRisk = risks.find((risk) => risk.id === planDraft.riskId);
  const retainedPrinciples = principles.filter((principle) => planDraft.principles[principle.id]?.decision === 'retained');

  const updateDraft = <K extends keyof RiskDraft>(field: K, value: RiskDraft[K]) => setDraft((current) => ({ ...current, [field]: value }));
  const showTop = () => document.querySelector('.duerp-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const currentRiskQuestionIsComplete = () => {
    const field = riskQuestions[riskQuestion].field;
    if (['analysisElements', 'measures'].includes(field)) return true;
    return Boolean(String(draft[field]).trim());
  };

  const saveRisk = () => {
    const missing = [meta.unit, meta.job, draft.activity, draft.family, draft.danger, draft.fearedEvent, draft.probability, draft.gravity].some((value) => !String(value).trim());
    if (missing) {
      setMessage('Complétez l’unité, le métier et les réponses indispensables avant d’ajouter cette ligne au DUERP.');
      return;
    }
    const previous = risks.find((risk) => risk.id === editingId);
    const record: RiskRecord = {
      ...draft, id: editingId || makeId(), riskNo: previous?.riskNo || currentRiskNumber, unit: meta.unit, job: meta.job,
      brut: score.brut, mastery: score.mastery, residual: score.residual,
    };
    setRisks((current) => editingId ? current.map((risk) => risk.id === editingId ? record : risk) : [...current, record]);
    setEditingId(record.id);
    setMessage(`Le risque ${record.riskNo} est enregistré. Vous pouvez maintenant construire son plan d’action ou analyser un autre risque.`);
    startPlan(record);
  };

  const nextRiskQuestion = () => {
    if (!currentRiskQuestionIsComplete()) {
      setMessage('Répondez à cette question avant de poursuivre.');
      return;
    }
    setMessage('');
    if (riskQuestion < riskQuestions.length - 1) {
      setRiskQuestion((current) => current + 1);
      showTop();
    } else saveRisk();
  };

  const editRisk = (risk: RiskRecord) => {
    const { id, riskNo: _riskNo, unit, job, brut: _brut, mastery: _mastery, residual: _residual, ...values } = risk;
    setMeta({ unit, job });
    setDraft(values);
    setEditingId(id);
    setRiskQuestion(0);
    setStep(2);
    setMessage(`Vous modifiez le risque ${risk.riskNo}.`);
    showTop();
  };

  const deleteRisk = (id: string) => {
    const risk = risks.find((item) => item.id === id);
    if (!risk || !window.confirm(`Supprimer ${risk.riskNo} et son éventuel plan d’action ?`)) return;
    setRisks((current) => current.filter((item) => item.id !== id));
    setPlans((current) => current.filter((plan) => plan.riskId !== id));
    if (editingId === id) setEditingId('');
    if (planDraft.riskId === id) setPlanDraft(newActionPlan());
    setMessage(`${risk.riskNo} a été retiré de l’exercice.`);
  };

  const newRisk = () => {
    setDraft(initialDraft);
    setEditingId('');
    setRiskQuestion(0);
    setStep(2);
    setMessage('Nouvelle ligne prête : le tableau se complètera au fil de vos réponses.');
    showTop();
  };

  const startPlan = (risk: RiskRecord) => {
    const existing = plans.find((plan) => plan.riskId === risk.id);
    setPlanDraft(existing ? { ...existing, principles: { ...emptyPrinciples(), ...existing.principles } } : newActionPlan(risk.id));
    setPrincipleQuestion(0);
    setStep(3);
    setMessage(`Plan d’action pour ${risk.riskNo} · ${risk.family}.`);
    showTop();
  };

  const updatePrinciple = (id: number, change: Partial<PrincipleAnswer>) => setPlanDraft((current) => ({
    ...current, principles: { ...current.principles, [id]: { ...current.principles[id], ...change } },
  }));

  const nextPrinciple = () => {
    const principle = principles[principleQuestion];
    const answer = planDraft.principles[principle.id];
    if (!answer?.decision || !answer.note.trim()) {
      setMessage('Indiquez si ce principe est retenu et notez la conclusion du groupe.');
      return;
    }
    setMessage('');
    setPrincipleQuestion((current) => Math.min(principles.length, current + 1));
    showTop();
  };

  const savePlan = () => {
    const allExamined = principles.every((principle) => {
      const answer = planDraft.principles[principle.id];
      return answer?.decision && answer.note.trim();
    });
    const detailsComplete = [planDraft.action, planDraft.priority, planDraft.responsible, planDraft.due, planDraft.means, planDraft.implementationIndicator, planDraft.successIndicator].every((value) => value.trim());
    if (!allExamined || !detailsComplete) {
      setMessage('Examinez les neuf principes et complétez toutes les informations du plan d’action.');
      return;
    }
    setPlans((current) => current.some((plan) => plan.riskId === planDraft.riskId)
      ? current.map((plan) => plan.riskId === planDraft.riskId ? planDraft : plan)
      : [...current, planDraft]);
    setMessage('Le plan d’action est enregistré dans la synthèse pédagogique.');
    setStep(4);
    showTop();
  };

  const resetWorkshop = () => {
    if (!window.confirm('Réinitialiser entièrement l’atelier ? Toutes les réponses enregistrées sur cet appareil seront effacées.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setMeta(initialMeta); setDraft(initialDraft); setRisks([]); setPlans([]); setPlanDraft(newActionPlan());
    setEditingId(''); setRiskQuestion(0); setPrincipleQuestion(0); setStep(1);
    setMessage('L’atelier est réinitialisé pour un nouveau groupe.');
    showTop();
  };

  const downloadPdf = async () => {
    if (!risks.length) { setMessage('Ajoutez au moins un risque avant de générer le document.'); return; }
    setIsGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = width - margin * 2;
      const bottom = height - 18;
      let y = 20;
      let page = 1;
      const footer = () => {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(96, 115, 108);
        pdf.text('Atelier pédagogique · DUERP-CSE et plan d’action', margin, height - 9);
        pdf.text(`Page ${page}`, width - margin, height - 9, { align: 'right' });
      };
      const nextPage = () => { footer(); pdf.addPage(); page += 1; y = 18; };
      const ensure = (space: number) => { if (y + space > bottom) nextPage(); };
      const lines = (value: string, maxWidth = contentWidth) => pdf.splitTextToSize(value.trim() || 'Non renseigné', maxWidth) as string[];
      const section = (title: string) => {
        ensure(14); y += 3; pdf.setFillColor(223, 241, 106); pdf.roundedRect(margin, y - 5, 7, 7, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.setTextColor(22, 52, 43); pdf.text(title, margin + 11, y); y += 9;
      };
      const field = (label: string, value: string) => {
        const content = lines(value); ensure(7 + content.length * 4.5);
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); pdf.setTextColor(22, 52, 43); pdf.text(label, margin, y);
        y += 4.5; pdf.setFont('helvetica', 'normal'); pdf.setTextColor(64, 83, 76); pdf.text(content, margin, y); y += content.length * 4.5 + 3;
      };

      pdf.setFillColor(15, 82, 61); pdf.rect(0, 0, width, 72, 'F');
      pdf.setTextColor(223, 241, 106); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); pdf.text('ATELIER POUR LES ÉLUS DU CSE · SUPPORT DE FORMATION', margin, 16);
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(22); pdf.text('Construire un DUERP', margin, 33); pdf.text('et son plan d’action', margin, 43);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); pdf.setTextColor(210, 226, 219);
      pdf.text(`${risks.length} risque${risks.length > 1 ? 's' : ''} analysé${risks.length > 1 ? 's' : ''} · ${plans.length} plan${plans.length > 1 ? 's' : ''} d’action`, margin, 59);
      y = 84;
      section('Cadre de l’exercice');
      field('Unité de travail', meta.unit);
      field('Métier', meta.job);
      field('Méthode de cotation', 'Risque brut = probabilité × gravité. Risque résiduel = risque brut × niveau de maîtrise déterminé à partir des mesures de prévention existantes.');

      risks.forEach((risk) => {
        nextPage();
        const plan = plans.find((item) => item.riskId === risk.id);
        pdf.setFillColor(242, 245, 243); pdf.roundedRect(margin, 16, contentWidth, 22, 3, 3, 'F');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15); pdf.setTextColor(22, 52, 43);
        pdf.text(`${risk.riskNo} · ${risk.family}`, margin + 5, 26, { maxWidth: contentWidth - 48 });
        pdf.setFontSize(9); pdf.text(`Résiduel ${formatNumber(risk.residual)} · ${levelFor(risk.residual)}`, width - margin - 5, 27, { align: 'right' });
        y = 48;
        section('Ligne du DUERP');
        field('Unité de travail · métier', `${risk.unit} · ${risk.job}`);
        field('Situation / poste / activité de travail réel', risk.activity);
        field('Origine · nature de la proposition', `${risk.source} · ${risk.nature}`);
        field('Éléments d’analyse', risk.analysisElements);
        field('Danger / situation dangereuse', risk.danger);
        field('Évènement redouté', risk.fearedEvent);
        field('Probabilité', `${risk.probability}/4 — ${risk.probabilityArgument || 'Justification non renseignée'}`);
        field('Gravité', `${risk.gravity}/4 — ${risk.gravityArgument || 'Justification non renseignée'}`);
        field('Risque brut', formatNumber(risk.brut));
        field('Mesures de prévention en place', splitMeasures(risk.measures).join(' · ') || 'Aucune mesure déclarée');
        field('Niveau de maîtrise', `${masteryLabel(risk.mastery)} · coefficient ${formatNumber(risk.mastery)}`);
        field('Risque résiduel', `${formatNumber(risk.residual)} · ${levelFor(risk.residual)}`);

        section('Examen des neuf principes généraux de prévention');
        principles.forEach((principle) => {
          const answer = plan?.principles[principle.id];
          field(`P${principle.id} · ${principle.title}`, answer ? `${answer.decision === 'retained' ? 'Retenu pour l’action' : 'Examiné, non retenu'} — ${answer.note}` : 'À examiner');
        });
        section('Plan d’action');
        field('Action proposée', plan?.action || 'À construire');
        field('Principes mobilisés', plan ? principles.filter((principle) => plan.principles[principle.id]?.decision === 'retained').map((principle) => `P${principle.id}`).join(', ') || 'Aucun principe retenu' : 'À renseigner');
        field('Priorité', plan?.priority || 'À renseigner');
        field('Responsable', plan?.responsible || 'À renseigner');
        field('Échéance', plan?.due ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${plan.due}T12:00:00`)) : 'À renseigner');
        field('Moyens', plan?.means || 'À renseigner');
        field('Indicateur de réalisation', plan?.implementationIndicator || 'À renseigner');
        field('Indicateur de réussite', plan?.successIndicator || 'À renseigner');
      });

      nextPage();
      section('Repères pédagogiques');
      field('Statut', 'Ce document est un support de formation. Il permet de comprendre la construction d’une évaluation des risques et d’un plan d’action ; il ne se substitue pas au DUERP établi sous la responsabilité de l’employeur.');
      field('Fondement', 'Neuf principes généraux de prévention — article L. 4121-2 du Code du travail. La prévention primaire, la suppression du danger et l’action à la source doivent être recherchées en priorité.');
      footer();
      pdf.save('atelier-pedagogique-duerp-et-plan-action.pdf');
      setMessage('Le document pédagogique PDF a été généré.');
    } finally { setIsGenerating(false); }
  };

  const liveRisk: RiskRecord = {
    ...draft, id: editingId || 'draft', riskNo: currentRiskNumber, unit: meta.unit, job: meta.job,
    brut: score.brut, mastery: score.mastery, residual: score.residual,
  };

  const riskTable = (showDraft = false) => {
    const rows = showDraft ? [...risks.filter((risk) => risk.id !== editingId), liveRisk] : risks;
    return <section className="duerp-live-board" aria-label="Tableau DUERP en construction">
      <div className="duerp-live-board-head"><div><span>Votre document en construction</span><h2>Tableau DUERP</h2></div><p>Faites défiler horizontalement pour suivre toutes les colonnes.</p></div>
      <div className="duerp-table-scroll"><table className="duerp-data-table">
        <thead><tr><th>N°</th><th>Unité</th><th>Métier</th><th>Situation de travail réelle</th><th>Origine</th><th>Nature de la proposition</th><th>Nature du risque</th><th>Élément d’analyse</th><th>Danger / situation dangereuse</th><th>Évènement redouté</th><th>Probabilité</th><th>Gravité</th><th>Risque brut</th><th>Mesures de prévention en place</th><th>Maîtrise du risque</th><th>Risque résiduel</th>{!showDraft ? <th>Actions</th> : null}</tr></thead>
        <tbody>{rows.length ? rows.map((risk) => {
          const isDraft = risk.id === 'draft' || risk.id === editingId;
          return <tr key={risk.id} className={isDraft && showDraft ? 'is-draft' : ''}>
            <td><strong>{risk.riskNo}</strong>{isDraft && showDraft ? <small>En cours</small> : null}</td>
            <td>{risk.unit || '—'}</td><td>{risk.job || '—'}</td><td>{risk.activity || '—'}</td><td>{risk.source || '—'}</td><td>{risk.nature || '—'}</td><td>{risk.family || '—'}</td><td>{risk.analysisElements || '—'}</td><td>{risk.danger || '—'}</td><td>{risk.fearedEvent || '—'}</td><td>{risk.probability || '—'}</td><td>{risk.gravity || '—'}</td><td>{risk.brut || '—'}</td><td>{splitMeasures(risk.measures).join(' · ') || 'Aucune'}</td><td>{masteryLabel(risk.mastery)}<small>Coef. {formatNumber(risk.mastery)}</small></td><td><span className={`duerp-risk-pill ${risk.residual ? levelClass(risk.residual) : ''}`}>{risk.residual ? formatNumber(risk.residual) : '—'}<small>{risk.residual ? levelFor(risk.residual) : 'À coter'}</small></span></td>
            {!showDraft ? <td><div className="duerp-table-actions"><button type="button" onClick={() => editRisk(risk)}>Modifier</button><button type="button" onClick={() => startPlan(risk)}>Plan d’action</button><button type="button" className="danger" onClick={() => deleteRisk(risk.id)}>Supprimer</button></div></td> : null}
          </tr>;
        }) : <tr><td colSpan={17} className="duerp-table-empty">Aucun risque enregistré. Commencez par répondre aux questions.</td></tr>}</tbody>
      </table></div>
    </section>;
  };

  const actionTable = (showDraft = false) => {
    const displayed = showDraft ? [...plans.filter((plan) => plan.riskId !== planDraft.riskId), planDraft] : plans;
    return <section className="duerp-live-board action-board" aria-label="Plan d’action en construction">
      <div className="duerp-live-board-head"><div><span>La prévention prend forme</span><h2>Tableau du plan d’action</h2></div><p>Chaque principe retenu doit conduire à une action vérifiable.</p></div>
      <div className="duerp-table-scroll"><table className="duerp-data-table action-table">
        <thead><tr><th>Risque</th><th>Action proposée</th><th>Principes mobilisés</th><th>Priorité</th><th>Responsable</th><th>Échéance</th><th>Moyens</th><th>Indicateur de réalisation</th><th>Indicateur de réussite</th></tr></thead>
        <tbody>{displayed.length ? displayed.map((plan) => {
          const risk = risks.find((item) => item.id === plan.riskId);
          const retained = principles.filter((principle) => plan.principles[principle.id]?.decision === 'retained');
          return <tr key={plan.riskId || 'draft'} className={showDraft && plan.riskId === planDraft.riskId ? 'is-draft' : ''}><td><strong>{risk?.riskNo || '—'}</strong><small>{risk?.family || ''}</small></td><td>{plan.action || '—'}</td><td>{retained.length ? retained.map((principle) => `P${principle.id}`).join(' · ') : '—'}</td><td>{plan.priority || '—'}</td><td>{plan.responsible || '—'}</td><td>{plan.due || '—'}</td><td>{plan.means || '—'}</td><td>{plan.implementationIndicator || '—'}</td><td>{plan.successIndicator || '—'}</td></tr>;
        }) : <tr><td colSpan={9} className="duerp-table-empty">Aucun plan d’action enregistré.</td></tr>}</tbody>
      </table></div>
    </section>;
  };

  const riskQuestionField = () => {
    switch (riskQuestions[riskQuestion].field) {
      case 'activity': return <label>Situation, poste ou activité de travail réelle<textarea rows={5} value={draft.activity} onChange={(event) => updateDraft('activity', event.target.value)} placeholder="Décrivez précisément ce que la personne fait, dans quelles conditions et à quel moment." /></label>;
      case 'source': return <label>Origine du risque<select value={draft.source} onChange={(event) => updateDraft('source', event.target.value)}><option>Analyse CSE</option><option>Inspection du CSE</option><option>Accident du travail</option><option>Enquête AT/MP</option><option>Incident / presque accident</option><option>Consultation</option><option>Réclamation</option><option>Droit d’alerte</option><option>Retour salarié</option><option>Autre</option></select></label>;
      case 'nature': return <label>Nature de la proposition<select value={draft.nature} onChange={(event) => updateDraft('nature', event.target.value)}><option>Nouveau risque proposé par le CSE</option><option>Mise à jour d’un risque existant dans le DUERP de l’entreprise</option><option>À vérifier dans le DUERP de l’entreprise</option></select></label>;
      case 'family': return <label>Famille de risque<select value={draft.family} onChange={(event) => updateDraft('family', event.target.value)}><option value="">Choisir une famille</option>{riskFamilies.map((family) => <option key={family}>{family}</option>)}</select></label>;
      case 'analysisElements': return <label>Éléments recueillis<textarea rows={5} value={draft.analysisElements} onChange={(event) => updateDraft('analysisElements', event.target.value)} placeholder="Faits observés, incidents, retours, documents ou données disponibles…" /></label>;
      case 'danger': return <label>Danger ou situation dangereuse<textarea rows={5} value={draft.danger} onChange={(event) => updateDraft('danger', event.target.value)} placeholder="Décrivez la source du dommage, l’exposition ou l’écart entre travail prescrit et travail réel." /></label>;
      case 'fearedEvent': return <label>Évènement redouté<input value={draft.fearedEvent} onChange={(event) => updateDraft('fearedEvent', event.target.value)} placeholder="Ex. chute, heurt, exposition, agression, épuisement…" /></label>;
      case 'probability': return <div className="duerp-answer-stack"><label>Probabilité / fréquence<select value={draft.probability} onChange={(event) => updateDraft('probability', event.target.value)}><option value="">Choisir une cotation</option>{probabilityOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Pourquoi retenez-vous cette probabilité ?<textarea rows={4} value={draft.probabilityArgument} onChange={(event) => updateDraft('probabilityArgument', event.target.value)} placeholder="Fréquence d’exposition, incidents connus, situations répétées…" /></label></div>;
      case 'gravity': return <div className="duerp-answer-stack"><label>Gravité du dommage<select value={draft.gravity} onChange={(event) => updateDraft('gravity', event.target.value)}><option value="">Choisir une cotation</option>{gravityOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Pourquoi retenez-vous cette gravité ?<textarea rows={4} value={draft.gravityArgument} onChange={(event) => updateDraft('gravityArgument', event.target.value)} placeholder="Nature, durée et réversibilité des dommages possibles…" /></label>{score.brut ? <div className={`duerp-calculation ${levelClass(score.brut)}`}><span>Risque brut</span><strong>{formatNumber(score.brut)}</strong><small>Probabilité {draft.probability} × gravité {draft.gravity}</small></div> : null}</div>;
      case 'measures': return <div className="duerp-answer-stack"><label>Mesures de prévention existantes<textarea rows={7} value={draft.measures} onChange={(event) => updateDraft('measures', event.target.value)} placeholder={'Saisissez une mesure réellement en place par ligne.\nEx. Aspiration à la source\nRotation organisée\nFormation réalisée'} /></label><div className="duerp-mastery-result"><div><span>{splitMeasures(draft.measures).length} mesure{splitMeasures(draft.measures).length > 1 ? 's' : ''} en place</span><strong>{masteryLabel(score.mastery)}</strong><small>Coefficient {formatNumber(score.mastery)}</small></div><div><span>Risque résiduel</span><strong>{score.residual ? formatNumber(score.residual) : '—'}</strong><small>{score.residual ? levelFor(score.residual) : 'Cotation incomplète'}</small></div></div><p className="duerp-method-note">Méthode Tatwin : aucune mesure = 1 ; une à deux mesures = 0,75 ; trois à quatre = 0,5 ; cinq ou plus = 0,25.</p></div>;
    }
  };

  return <main className="duerp-page" id="top">
    <header className="site-header">
      <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
      <div className="duerp-header-actions"><button type="button" onClick={resetWorkshop}>Réinitialiser l’atelier</button><a className="header-link" href="/">Tous les ateliers</a></div>
    </header>

    <section className="duerp-hero">
      <div><p className="eyebrow">Atelier 05 · Parcours pédagogique DUERP</p><h1>Du risque à l’action.</h1><p>Choisissez une situation de travail, construisez sa ligne du document unique, mesurez le risque résiduel puis transformez l’analyse en prévention.</p></div>
      <aside className="duerp-legal-note"><span>La règle du jeu</span><strong>Les neuf principes se parcourent dans l’ordre : éviter, combattre à la source, protéger collectivement et vérifier le résultat.</strong><div><a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033019913/" target="_blank" rel="noreferrer">Article L. 4121-2 ↗</a></div></aside>
    </section>

    <nav className="duerp-steps" aria-label="Étapes de l’atelier">
      {[[1, 'Unité & métier'], [2, 'Construire le DUERP'], [3, 'Bâtir le plan d’action'], [4, 'Synthèse & PDF']].map(([number, label]) => <button key={number} className={step === number ? 'active' : step > Number(number) ? 'done' : ''} onClick={() => { setStep(Number(number) as MainStep); window.requestAnimationFrame(showTop); }}><span>{number}</span><strong>{label}</strong></button>)}
      <p>{savedLabel}</p>
    </nav>

    <section className="duerp-workspace">
      {message ? <div className="duerp-message" role="status"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Fermer le message">×</button></div> : null}

      {step === 1 ? <div className="duerp-stage">
        <div className="duerp-stage-heading"><div><p className="eyebrow">Point de départ</p><h2>Choisissez votre terrain de jeu.</h2></div><p>Dans cet atelier, aucun effectif n’est demandé. Le groupe travaille uniquement à partir d’une unité de travail, d’un métier et d’un risque librement choisi.</p></div>
        <div className="duerp-framing-card"><div><span>01</span><label>Quelle unité de travail analysez-vous ?<input value={meta.unit} onChange={(event) => setMeta((current) => ({ ...current, unit: event.target.value }))} placeholder="Ex. Accueil, atelier, interventions extérieures…" /></label></div><div><span>02</span><label>Quel métier est concerné ?<input value={meta.job} onChange={(event) => setMeta((current) => ({ ...current, job: event.target.value }))} placeholder="Ex. Agent d’accueil, technicien, aide à domicile…" /></label></div></div>
        <div className="duerp-stage-actions"><a href="/">Quitter l’atelier</a><button className="button primary" type="button" onClick={() => { if (!meta.unit.trim() || !meta.job.trim()) { setMessage('Renseignez l’unité de travail et le métier pour commencer.'); return; } setMessage(''); setStep(2); showTop(); }}>Commencer les questions <span>→</span></button></div>
      </div> : null}

      {step === 2 ? <div className="duerp-stage">
        {riskTable(true)}
        <article className="duerp-question-card">
          <header><div><span>Question {riskQuestion + 1} sur {riskQuestions.length}</span><h2>{riskQuestions[riskQuestion].title}</h2></div><div className="duerp-question-context"><strong>{currentRiskNumber}</strong><small>{meta.unit || 'Unité à préciser'} · {meta.job || 'Métier à préciser'}</small></div></header>
          <div className="duerp-question-progress"><i style={{ width: `${((riskQuestion + 1) / riskQuestions.length) * 100}%` }} /></div>
          <p className="duerp-question-prompt">{riskQuestions[riskQuestion].prompt}</p>
          <div className="duerp-question-answer">{riskQuestionField()}</div>
          <footer><button className="text-button" type="button" onClick={() => riskQuestion ? setRiskQuestion((current) => current - 1) : setStep(1)}>{riskQuestion ? '← Question précédente' : '← Unité et métier'}</button><button className="button primary" type="button" onClick={nextRiskQuestion}>{riskQuestion === riskQuestions.length - 1 ? 'Ajouter au DUERP' : 'Question suivante'} <span>→</span></button></footer>
        </article>
      </div> : null}

      {step === 3 ? <div className="duerp-stage">
        {risks.length ? actionTable(Boolean(planRisk)) : null}
        {!risks.length ? <div className="duerp-empty-state"><span>Plan d’action</span><h2>Commencez par enregistrer un risque.</h2><p>Le plan d’action s’appuie toujours sur une ligne DUERP cotée.</p><button className="button primary" type="button" onClick={newRisk}>Construire une ligne DUERP</button></div>
          : !planRisk ? <div className="duerp-panel"><div className="duerp-panel-title"><div><h3>Quel risque voulez-vous traiter ?</h3><p>Chaque risque enregistré peut recevoir son propre plan d’action.</p></div><span>{plans.length}/{risks.length} réalisés</span></div><div className="duerp-plan-picker">{risks.map((risk) => { const plan = plans.find((item) => item.riskId === risk.id); return <button type="button" key={risk.id} onClick={() => startPlan(risk)}><span className={`duerp-record-score ${levelClass(risk.residual)}`}><strong>{formatNumber(risk.residual)}</strong><small>{levelFor(risk.residual)}</small></span><span><small>{risk.riskNo} · {plan ? 'Plan enregistré' : 'Plan à construire'}</small><strong>{risk.family}</strong><em>{risk.activity}</em></span><b>→</b></button>; })}</div></div>
            : principleQuestion < principles.length ? (() => { const principle = principles[principleQuestion]; const answer = planDraft.principles[principle.id]; return <article className="duerp-principle-card"><header><div><span>Principe {principle.id} sur 9 · Article L. 4121-2</span><h2>{principle.title}</h2></div><strong>P{principle.id}</strong></header><div className="duerp-question-progress"><i style={{ width: `${((principleQuestion + 1) / principles.length) * 100}%` }} /></div><p className="duerp-principle-question">{principle.question}</p><div className="duerp-decision-buttons"><button type="button" className={answer?.decision === 'retained' ? 'selected' : ''} onClick={() => updatePrinciple(principle.id, { decision: 'retained' })}><span>✓</span><strong>Retenir ce principe</strong><small>Il contribuera directement à l’action.</small></button><button type="button" className={answer?.decision === 'not-retained' ? 'selected muted' : ''} onClick={() => updatePrinciple(principle.id, { decision: 'not-retained' })}><span>○</span><strong>Examiné, non retenu</strong><small>Expliquez pourquoi il ne guide pas cette action.</small></button></div><label>Conclusion du groupe<textarea rows={5} value={answer?.note || ''} onChange={(event) => updatePrinciple(principle.id, { note: event.target.value })} placeholder="Notez le raisonnement qui relie ce principe au risque étudié." /></label><footer><button className="text-button" type="button" onClick={() => principleQuestion ? setPrincipleQuestion((current) => current - 1) : setPlanDraft(newActionPlan())}>{principleQuestion ? '← Principe précédent' : '← Choisir un autre risque'}</button><button className="button primary" type="button" onClick={nextPrinciple}>{principleQuestion === principles.length - 1 ? 'Formuler l’action' : 'Principe suivant'} <span>→</span></button></footer></article>; })()
              : <article className="duerp-action-form"><header><div><span>Les neuf principes ont été examinés</span><h2>Formulez une action vérifiable.</h2></div><div>{retainedPrinciples.map((principle) => <span key={principle.id}>P{principle.id}</span>)}</div></header><div className="duerp-form-grid two"><label className="wide">Action proposée<textarea rows={5} value={planDraft.action} onChange={(event) => setPlanDraft((current) => ({ ...current, action: event.target.value }))} placeholder="Commencez par un verbe : supprimer, remplacer, réorganiser, aménager, installer…" /></label><label>Priorité<select value={planDraft.priority} onChange={(event) => setPlanDraft((current) => ({ ...current, priority: event.target.value }))}><option value="">Choisir</option><option>Urgent et important</option><option>Non urgent et important</option><option>Urgent et temporaire</option><option>À programmer</option></select></label><label>Responsable<input value={planDraft.responsible} onChange={(event) => setPlanDraft((current) => ({ ...current, responsible: event.target.value }))} placeholder="Fonction qui pilote l’action" /></label><label>Échéance<input type="date" value={planDraft.due} onChange={(event) => setPlanDraft((current) => ({ ...current, due: event.target.value }))} /></label><label>Moyens nécessaires<textarea rows={4} value={planDraft.means} onChange={(event) => setPlanDraft((current) => ({ ...current, means: event.target.value }))} placeholder="Budget, temps, compétences, matériel…" /></label><label>Indicateur de réalisation<input value={planDraft.implementationIndicator} onChange={(event) => setPlanDraft((current) => ({ ...current, implementationIndicator: event.target.value }))} placeholder="Ce qui prouve que l’action est réalisée" /></label><label>Indicateur de réussite<input value={planDraft.successIndicator} onChange={(event) => setPlanDraft((current) => ({ ...current, successIndicator: event.target.value }))} placeholder="Ce qui prouve que l’exposition diminue" /></label></div><footer><button className="text-button" type="button" onClick={() => setPrincipleQuestion(principles.length - 1)}>← Revoir les principes</button><button className="button primary" type="button" onClick={savePlan}>Enregistrer le plan d’action <span>→</span></button></footer></article>}
      </div> : null}

      {step === 4 ? <div className="duerp-stage">
        <div className="duerp-stage-heading"><div><p className="eyebrow">Synthèse de l’exercice</p><h2>Du danger à la prévention.</h2></div><p>Relisez les lignes construites par le groupe. Un risque sans plan d’action reste visible afin de montrer que l’évaluation doit toujours déboucher sur la prévention.</p></div>
        {riskTable(false)}
        {actionTable(false)}
        <div className="duerp-report-panel"><div><p className="eyebrow">Document de sortie</p><h3>Emportez la méthode avec vous.</h3><p>Le PDF reprend chaque ligne DUERP, le calcul du risque résiduel, l’examen des neuf principes et le plan d’action associé.</p></div><div><button className="text-button light" type="button" onClick={newRisk}>+ Analyser un autre risque</button><button className="button primary" type="button" onClick={downloadPdf} disabled={isGenerating}>{isGenerating ? 'Création du PDF…' : 'Télécharger le document PDF'}</button></div></div>
        <div className="duerp-responsibility"><strong>Support de formation</strong><p>Cette production aide les élus à comprendre la démarche. Elle ne se substitue pas au DUERP établi et mis à jour sous la responsabilité de l’employeur.</p><a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023795562" target="_blank" rel="noreferrer">Article R. 4121-1 ↗</a></div>
      </div> : null}
    </section>
  </main>;
}
