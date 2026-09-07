'use client';

import { useEffect, useMemo, useState } from 'react';

type SexStats = {
  headcount: string;
  accidents: string;
  diseases: string;
  seniority: string;
  permanent: string;
  temporary: string;
};

type WorkshopMeta = {
  organization: string;
  workforce: string;
  versionDate: string;
  contributors: string;
  unit: string;
  jobs: string;
  women: SexStats;
  men: SexStats;
};

type RiskDraft = {
  activity: string;
  source: string;
  nature: string;
  family: string;
  analysisElements: string;
  danger: string;
  fearedEvent: string;
  womenExposed: string;
  menExposed: string;
  taskDistribution: string;
  equipmentAdaptation: string;
  workTime: string;
  reproductiveImpact: string;
  vsstRisk: string;
  differentialFinding: string;
  differentialArgument: string;
  probability: string;
  probabilityArgument: string;
  gravity: string;
  gravityArgument: string;
  measures: string;
  proposedAction: string;
};

type RiskRecord = RiskDraft & {
  id: string;
  riskNo: string;
  unit: string;
  brut: number;
  mastery: number;
  residual: number;
};

const STORAGE_KEY = 'cse-duerp-differencie-v1';

const emptySexStats: SexStats = { headcount: '', accidents: '', diseases: '', seniority: '', permanent: '', temporary: '' };
const initialMeta: WorkshopMeta = {
  organization: '', workforce: '', versionDate: '', contributors: '', unit: '', jobs: '',
  women: { ...emptySexStats }, men: { ...emptySexStats },
};
const initialDraft: RiskDraft = {
  activity: '', source: 'Analyse CSE', nature: 'Nouveau risque proposé par le CSE', family: '', analysisElements: '', danger: '', fearedEvent: '',
  womenExposed: '', menExposed: '', taskDistribution: '', equipmentAdaptation: '', workTime: '', reproductiveImpact: 'À questionner', vsstRisk: 'À questionner',
  differentialFinding: 'À approfondir', differentialArgument: '', probability: '', probabilityArgument: '', gravity: '', gravityArgument: '', measures: '', proposedAction: '',
};

const riskFamilies = [
  'Chutes de plain-pied', 'Chutes de hauteur', 'Circulations et déplacements internes', 'Risque routier en mission',
  'Activité physique et manutention manuelle', 'Manutention mécanique', 'Risque chimique (produits, émissions, poussières)',
  'Agents biologiques', 'Équipements de travail et machines', 'Effondrements et chutes d’objets', 'Bruit', 'Ambiances thermiques',
  'Incendie et explosion', 'Risque électrique', 'Éclairage et ambiances lumineuses', 'Rayonnements', 'Risques psychosociaux',
  'Vibrations', 'Travail sur écran', 'Travail isolé', 'Coactivité et entreprises extérieures', 'Pratiques addictives',
  'Violences sexistes et sexuelles au travail (VSST)', 'Autre risque',
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

const makeId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const splitMeasures = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const masteryFromMeasures = (value: string) => {
  const count = splitMeasures(value).length;
  if (count === 0) return 1;
  if (count < 3) return 0.75;
  if (count < 5) return 0.5;
  return 0.25;
};
const roundOne = (value: number) => Math.round(value * 10) / 10;
const levelFor = (score: number) => score <= 1 ? 'Faible' : score <= 3 ? 'Modéré' : score <= 8 ? 'Élevé' : 'Critique';
const levelClass = (score: number) => score <= 1 ? 'low' : score <= 3 ? 'medium' : score <= 8 ? 'high' : 'critical';
const formatDate = (value: string) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`)) : 'Non renseignée';

export default function DuerpWorkshop() {
  const [step, setStep] = useState(1);
  const [meta, setMeta] = useState<WorkshopMeta>(initialMeta);
  const [draft, setDraft] = useState<RiskDraft>(initialDraft);
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [editingId, setEditingId] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [savedLabel, setSavedLabel] = useState('Sauvegarde locale active');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { meta?: WorkshopMeta; draft?: RiskDraft; risks?: RiskRecord[] };
        if (parsed.meta) setMeta({ ...initialMeta, ...parsed.meta, women: { ...emptySexStats, ...parsed.meta.women }, men: { ...emptySexStats, ...parsed.meta.men } });
        if (parsed.draft) setDraft({ ...initialDraft, ...parsed.draft });
        if (parsed.risks) setRisks(parsed.risks);
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta, draft, risks }));
        setSavedLabel('Enregistré sur cet appareil');
      } catch {
        setSavedLabel('Sauvegarde indisponible');
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [meta, draft, risks, hydrated]);

  const updateMeta = <K extends keyof Omit<WorkshopMeta, 'women' | 'men'>>(field: K, value: WorkshopMeta[K]) => setMeta((current) => ({ ...current, [field]: value }));
  const updateSexStats = (sex: 'women' | 'men', field: keyof SexStats, value: string) => setMeta((current) => ({ ...current, [sex]: { ...current[sex], [field]: value } }));
  const updateDraft = <K extends keyof RiskDraft>(field: K, value: RiskDraft[K]) => setDraft((current) => ({ ...current, [field]: value }));

  const score = useMemo(() => {
    const probability = Number(draft.probability);
    const gravity = Number(draft.gravity);
    const mastery = masteryFromMeasures(draft.measures);
    const brut = probability && gravity ? roundOne(probability * gravity) : 0;
    return { brut, mastery, residual: brut ? roundOne(brut * mastery) : 0 };
  }, [draft.probability, draft.gravity, draft.measures]);

  const mixity = useMemo(() => {
    const women = Number(draft.womenExposed || meta.women.headcount || 0);
    const men = Number(draft.menExposed || meta.men.headcount || 0);
    if (!women && !men) return 'À questionner';
    if (women === men) return 'Mixte';
    return women > men ? 'Majoritairement féminine' : 'Majoritairement masculine';
  }, [draft.womenExposed, draft.menExposed, meta.women.headcount, meta.men.headcount]);

  const saveRisk = () => {
    const missing = [meta.unit, draft.activity, draft.family, draft.danger, draft.fearedEvent, draft.probability, draft.gravity].some((value) => !String(value).trim());
    if (missing) {
      setMessage('Complétez au minimum l’unité, la situation réelle, la famille de risque, le danger, l’évènement redouté, la probabilité et la gravité.');
      return;
    }
    const previous = risks.find((risk) => risk.id === editingId);
    const record: RiskRecord = {
      ...draft,
      id: editingId || makeId(),
      riskNo: previous?.riskNo || `R-${String(risks.length + 1).padStart(3, '0')}`,
      unit: meta.unit,
      brut: score.brut,
      mastery: score.mastery,
      residual: score.residual,
    };
    setRisks((current) => editingId ? current.map((risk) => risk.id === editingId ? record : risk) : [...current, record]);
    setEditingId(record.id);
    setMessage(`Le risque ${record.riskNo} a été ${previous ? 'mis à jour' : 'ajouté'} dans la proposition de DUERP-CSE.`);
  };

  const editRisk = (risk: RiskRecord) => {
    const { id, riskNo: _riskNo, unit, brut: _brut, mastery: _mastery, residual: _residual, ...values } = risk;
    setMeta((current) => ({ ...current, unit }));
    setDraft(values);
    setEditingId(id);
    setMessage(`Modification du risque ${risk.riskNo}.`);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRisk = (id: string) => {
    setRisks((current) => current.filter((risk) => risk.id !== id));
    if (editingId === id) setEditingId('');
    setMessage('La ligne a été retirée de la proposition.');
  };

  const newRisk = () => {
    setDraft(initialDraft);
    setEditingId('');
    setMessage('Nouvelle analyse prête à être complétée.');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadPdf = async () => {
    if (!risks.length) {
      setMessage('Ajoutez au moins un risque avant de générer le document.');
      return;
    }
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
        pdf.text(`Proposition DUERP-CSE · ${meta.organization || 'Structure non renseignée'}`, margin, height - 9);
        pdf.text(`Page ${page}`, width - margin, height - 9, { align: 'right' });
      };
      const nextPage = () => { footer(); pdf.addPage(); page += 1; y = 18; };
      const ensure = (space: number) => { if (y + space > bottom) nextPage(); };
      const textLines = (value: string, maxWidth = contentWidth) => pdf.splitTextToSize(value.trim() || 'Non renseigné', maxWidth) as string[];
      const section = (title: string) => {
        ensure(14); y += 3; pdf.setFillColor(223, 241, 106); pdf.roundedRect(margin, y - 5, 7, 7, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.setTextColor(22, 52, 43); pdf.text(title, margin + 11, y); y += 9;
      };
      const field = (label: string, value: string) => {
        const lines = textLines(value); ensure(7 + lines.length * 4.5);
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); pdf.setTextColor(22, 52, 43); pdf.text(label, margin, y);
        y += 4.5; pdf.setFont('helvetica', 'normal'); pdf.setTextColor(64, 83, 76); pdf.text(lines, margin, y); y += lines.length * 4.5 + 3;
      };

      pdf.setFillColor(15, 82, 61); pdf.rect(0, 0, width, 66, 'F');
      pdf.setTextColor(223, 241, 106); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); pdf.text('ATELIER POUR LES ÉLUS DU CSE · 11 À 49 SALARIÉS', margin, 15);
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(23); pdf.text('Proposition de DUERP-CSE', margin, 31);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10.5); pdf.text(textLines('Analyse différenciée des risques professionnels pour les femmes et les hommes', contentWidth), margin, 42);
      pdf.setFontSize(8.5); pdf.setTextColor(210, 226, 219); pdf.text(`Version du ${formatDate(meta.versionDate)} · ${risks.length} risque${risks.length > 1 ? 's' : ''} analysé${risks.length > 1 ? 's' : ''}`, margin, 57);
      y = 77;

      section('1. Cadre de la démarche');
      field('Structure', meta.organization);
      field('Effectif', meta.workforce || '11 à 49 salariés');
      field('Contributeurs CSE', meta.contributors);
      field('Unité de travail', meta.unit);
      field('Métiers et activités', meta.jobs);

      section('2. Données sexuées de l’unité');
      field('Femmes', `${meta.women.headcount || '—'} salariée(s) · AT sur 3 ans : ${meta.women.accidents || '—'} · MP sur 3 ans : ${meta.women.diseases || '—'} · ancienneté moyenne : ${meta.women.seniority || '—'} · CDI : ${meta.women.permanent || '—'} · CDD/intérim/alternance : ${meta.women.temporary || '—'}`);
      field('Hommes', `${meta.men.headcount || '—'} salarié(s) · AT sur 3 ans : ${meta.men.accidents || '—'} · MP sur 3 ans : ${meta.men.diseases || '—'} · ancienneté moyenne : ${meta.men.seniority || '—'} · CDI : ${meta.men.permanent || '—'} · CDD/intérim/alternance : ${meta.men.temporary || '—'}`);

      risks.forEach((risk) => {
        nextPage();
        pdf.setFillColor(242, 245, 243); pdf.roundedRect(margin, 16, contentWidth, 22, 3, 3, 'F');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16); pdf.setTextColor(22, 52, 43); pdf.text(`${risk.riskNo} · ${risk.family}`, margin + 5, 26, { maxWidth: contentWidth - 44 });
        const color = levelClass(risk.residual) === 'critical' ? [168, 66, 56] : levelClass(risk.residual) === 'high' ? [196, 112, 28] : levelClass(risk.residual) === 'medium' ? [161, 125, 18] : [23, 111, 82];
        pdf.setTextColor(color[0], color[1], color[2]); pdf.setFontSize(9); pdf.text(`${levelFor(risk.residual)} · ${String(risk.residual).replace('.', ',')}`, width - margin - 5, 27, { align: 'right' });
        y = 48;
        section('Situation de travail et identification');
        field('Unité de travail', risk.unit);
        field('Situation / poste / activité réelle', risk.activity);
        field('Origine et nature', `${risk.source} · ${risk.nature}`);
        field('Éléments recueillis', risk.analysisElements);
        field('Danger / situation dangereuse', risk.danger);
        field('Évènement redouté', risk.fearedEvent);

        section('Analyse différenciée femmes / hommes');
        const womenExposed = Number(risk.womenExposed || 0);
        const menExposed = Number(risk.menExposed || 0);
        const riskMixity = !womenExposed && !menExposed ? 'Mixité à questionner' : womenExposed === menExposed ? 'Mixte' : womenExposed > menExposed ? 'Majoritairement féminine' : 'Majoritairement masculine';
        field('Population exposée et mixité', `Femmes : ${risk.womenExposed || '—'} · Hommes : ${risk.menExposed || '—'} · ${riskMixity}`);
        field('Répartition réelle des tâches', risk.taskDistribution);
        field('Postes, matériels et EPI', risk.equipmentAdaptation);
        field('Temps et organisation du travail', risk.workTime);
        field('Santé reproductive / grossesse / allaitement', risk.reproductiveImpact);
        field('VSST / agissements sexistes', risk.vsstRisk);
        field('Conclusion', `${risk.differentialFinding} — ${risk.differentialArgument || 'Argumentation à compléter'}`);

        section('Cotation et prévention');
        field('Cotation', `Probabilité : ${risk.probability}/4 · Gravité : ${risk.gravity}/4 · Risque brut : ${risk.brut} · Maîtrise : ${String(risk.mastery).replace('.', ',')} · Risque résiduel : ${risk.residual} (${levelFor(risk.residual)})`);
        field('Justification de la probabilité', risk.probabilityArgument);
        field('Justification de la gravité', risk.gravityArgument);
        field('Mesures de prévention existantes', splitMeasures(risk.measures).join(' · ') || 'Aucune mesure déclarée');
        field('Action proposée par le CSE', risk.proposedAction);
      });

      nextPage();
      section('Repères et statut du document');
      field('Responsabilité', 'Ce document est une proposition de travail du CSE. L’employeur reste responsable de l’évaluation des risques ainsi que de la transcription et de la mise à jour du DUERP. Le CSE contribue à cette évaluation et est consulté sur le document et ses mises à jour.');
      field('Méthode', 'Cotation pédagogique issue du module Tatwin : risque brut = probabilité × gravité ; risque résiduel = risque brut × niveau de maîtrise. Les seuils et la méthode doivent être discutés collectivement et adaptés à l’entreprise.');
      field('Références', 'Code du travail : articles L. 4121-3, R. 4121-1 et R. 4121-2. Guide Anact : réaliser une évaluation différenciée des risques professionnels pour les femmes et les hommes.');
      footer();
      pdf.save(`proposition-duerp-cse-${meta.versionDate || 'atelier'}.pdf`);
      setMessage('Le rapport PDF a été généré.');
    } finally {
      setIsGenerating(false);
    }
  };

  const sexStatsBlock = (sex: 'women' | 'men', title: string) => (
    <div className={`duerp-sex-card ${sex}`}>
      <div className="duerp-sex-title"><span>{sex === 'women' ? 'F' : 'H'}</span><h3>{title}</h3></div>
      <div className="duerp-form-grid three">
        <label>Effectif<input type="number" min="0" value={meta[sex].headcount} onChange={(event) => updateSexStats(sex, 'headcount', event.target.value)} placeholder="0" /></label>
        <label>Accidents du travail · 3 ans<input type="number" min="0" value={meta[sex].accidents} onChange={(event) => updateSexStats(sex, 'accidents', event.target.value)} placeholder="0" /></label>
        <label>Maladies professionnelles · 3 ans<input type="number" min="0" value={meta[sex].diseases} onChange={(event) => updateSexStats(sex, 'diseases', event.target.value)} placeholder="0" /></label>
        <label>Ancienneté moyenne<input value={meta[sex].seniority} onChange={(event) => updateSexStats(sex, 'seniority', event.target.value)} placeholder="Ex. 6 ans" /></label>
        <label>Emplois en CDI<input type="number" min="0" value={meta[sex].permanent} onChange={(event) => updateSexStats(sex, 'permanent', event.target.value)} placeholder="0" /></label>
        <label>CDD, intérim, alternance<input type="number" min="0" value={meta[sex].temporary} onChange={(event) => updateSexStats(sex, 'temporary', event.target.value)} placeholder="0" /></label>
      </div>
    </div>
  );

  return (
    <main className="duerp-page" id="top">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
        <a className="header-link" href="/">Tous les ateliers</a>
      </header>

      <section className="duerp-hero">
        <div><p className="eyebrow">Atelier 05 · Issu du module Tatwin</p><h1>Voir les risques autrement.</h1><p>Partez du travail réel, questionnez les expositions des femmes et des hommes, cotez le risque et formalisez une proposition de DUERP-CSE.</p></div>
        <aside className="duerp-legal-note"><span>Le repère essentiel</span><strong>L’analyse doit tenir compte de l’impact différencié de l’exposition au risque en fonction du sexe.</strong><div><a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893923" target="_blank" rel="noreferrer">Article L. 4121-3 ↗</a><a href="https://www.anact.fr/sites/default/files/2025-10/guide-e%CC%81valuation-diffe%CC%81rencie%CC%81e.pdf" target="_blank" rel="noreferrer">Guide Anact ↗</a></div></aside>
      </section>

      <nav className="duerp-steps" aria-label="Étapes de l’atelier">
        {[[1, 'Cadrer'], [2, 'Identifier'], [3, 'Différencier'], [4, 'Coter'], [5, 'Formaliser']].map(([number, label]) => (
          <button key={number} className={step === number ? 'active' : step > Number(number) ? 'done' : ''} onClick={() => setStep(Number(number))}><span>{number}</span><strong>{label}</strong></button>
        ))}
        <p>{savedLabel}</p>
      </nav>

      <section className="duerp-workspace">
        {message && <div className="duerp-message" role="status"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Fermer le message">×</button></div>}

        {step === 1 && <div className="duerp-stage">
          <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 1 · Cadrer</p><h2>Définir l’unité de travail</h2></div><p>Une unité regroupe des activités et des risques cohérents : métier, lieu, service ou croisement de ces critères.</p></div>
          <div className="duerp-panel"><h3>Cadre du document</h3><div className="duerp-form-grid two"><label>Association ou entreprise<input value={meta.organization} onChange={(event) => updateMeta('organization', event.target.value)} placeholder="Nom de la structure" /></label><label>Effectif<input value={meta.workforce} onChange={(event) => updateMeta('workforce', event.target.value)} placeholder="Ex. 32 salariés" /></label><label>Date de cette version<input type="date" value={meta.versionDate} onChange={(event) => updateMeta('versionDate', event.target.value)} /></label><label>Élus et contributeurs<input value={meta.contributors} onChange={(event) => updateMeta('contributors', event.target.value)} placeholder="Noms ou fonctions" /></label></div></div>
          <div className="duerp-panel"><h3>Unité analysée</h3><div className="duerp-form-grid two"><label>Nom de l’unité de travail<input value={meta.unit} onChange={(event) => updateMeta('unit', event.target.value)} placeholder="Ex. Accueil, interventions extérieures, salle de cours…" /></label><label>Métiers et activités concernés<textarea rows={3} value={meta.jobs} onChange={(event) => updateMeta('jobs', event.target.value)} placeholder="Décrivez les métiers présents dans cette unité." /></label></div></div>
          <div className="duerp-panel"><div className="duerp-panel-title"><div><h3>Données collectives femmes / hommes</h3><p>Comparez les données disponibles sans collecter d’information médicale individuelle.</p></div><span>3 dernières années</span></div><div className="duerp-sex-grid">{sexStatsBlock('women', 'Femmes')}{sexStatsBlock('men', 'Hommes')}</div></div>
          <div className="duerp-stage-actions"><a href="/">Quitter l’atelier</a><button className="button primary" onClick={() => setStep(2)}>Identifier un risque <span>→</span></button></div>
        </div>}

        {step === 2 && <div className="duerp-stage">
          <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 2 · Identifier</p><h2>Décrire le travail réel</h2></div><p>Décrivez des faits observables : ce que les salariés font réellement, le danger et le dommage redouté.</p></div>
          <div className="duerp-panel"><div className="duerp-risk-banner"><span>{editingId ? 'Risque en modification' : `Prochaine ligne · R-${String(risks.length + 1).padStart(3, '0')}`}</span><strong>{meta.unit || 'Unité de travail à préciser'}</strong></div><label>Situation, poste ou activité de travail réelle<textarea rows={4} value={draft.activity} onChange={(event) => updateDraft('activity', event.target.value)} placeholder="Ex. En fin de journée, la personne seule à l’accueil doit gérer simultanément les appels, les visiteurs et la fermeture…" /></label><div className="duerp-form-grid two"><label>Comment le risque a-t-il été identifié ?<select value={draft.source} onChange={(event) => updateDraft('source', event.target.value)}><option>Analyse CSE</option><option>Inspection du CSE</option><option>Accident du travail</option><option>Enquête AT/MP</option><option>Incident / presque accident</option><option>Consultation</option><option>Réclamation</option><option>Droit d’alerte</option><option>Retour salarié</option><option>Autre</option></select></label><label>Nature de la proposition<select value={draft.nature} onChange={(event) => updateDraft('nature', event.target.value)}><option>Nouveau risque proposé par le CSE</option><option>Mise à jour d’un risque existant dans le DUERP de l’entreprise</option><option>À vérifier dans le DUERP de l’entreprise</option></select></label></div><label>Famille de risque<select value={draft.family} onChange={(event) => updateDraft('family', event.target.value)}><option value="">Choisir une famille de risque</option>{riskFamilies.map((family) => <option key={family}>{family}</option>)}</select></label><label>Éléments recueillis<textarea rows={3} value={draft.analysisElements} onChange={(event) => updateDraft('analysisElements', event.target.value)} placeholder="Observations, incidents, retours salariés, données collectives, documents consultés…" /></label></div>
          <div className="duerp-panel danger-panel"><div><span>Danger</span><h3>Quelle est la source possible du dommage ?</h3></div><label>Danger ou situation dangereuse<textarea rows={4} value={draft.danger} onChange={(event) => updateDraft('danger', event.target.value)} placeholder="Décrivez l’exposition, l’aléa ou l’écart entre le travail prescrit et le travail réel." /></label><label>Évènement redouté<input value={draft.fearedEvent} onChange={(event) => updateDraft('fearedEvent', event.target.value)} placeholder="Ex. chute, agression, épuisement, exposition chimique…" /></label></div>
          <div className="duerp-stage-actions"><button className="text-button" onClick={() => setStep(1)}>← Cadrer</button><button className="button primary" onClick={() => setStep(3)}>Faire l’analyse différenciée <span>→</span></button></div>
        </div>}

        {step === 3 && <div className="duerp-stage">
          <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 3 · Différencier</p><h2>Questionner les écarts d’exposition</h2></div><p>Il ne s’agit pas de supposer des différences : on vérifie la répartition réelle du travail et les effets possibles du risque.</p></div>
          <div className="duerp-panel"><div className="duerp-panel-title"><div><h3>Population réellement exposée</h3><p>L’effectif se rapporte à ce risque précis, pas nécessairement à toute l’unité.</p></div><span className="mixity-chip">{mixity}</span></div><div className="duerp-form-grid two"><label>Femmes exposées<input type="number" min="0" value={draft.womenExposed} onChange={(event) => updateDraft('womenExposed', event.target.value)} placeholder={meta.women.headcount || '0'} /></label><label>Hommes exposés<input type="number" min="0" value={draft.menExposed} onChange={(event) => updateDraft('menExposed', event.target.value)} placeholder={meta.men.headcount || '0'} /></label></div></div>
          <div className="duerp-question-grid">
            <article><span>01</span><h3>Qui fait quoi, réellement ?</h3><p>Rotation, polyvalence, activités invisibles, tâches répétitives ou physiquement exigeantes.</p><textarea rows={5} value={draft.taskDistribution} onChange={(event) => updateDraft('taskDistribution', event.target.value)} placeholder="Décrivez les écarts ou les points vérifiés…" /></article>
            <article><span>02</span><h3>Le matériel convient-il à toutes et tous ?</h3><p>Hauteur du poste, gants, chaussures, EPI, outils, port de charges, accès aux commandes.</p><textarea rows={5} value={draft.equipmentAdaptation} onChange={(event) => updateDraft('equipmentAdaptation', event.target.value)} placeholder="Notez les adaptations et limites observées…" /></article>
            <article><span>03</span><h3>Les temps exposent-ils différemment ?</h3><p>Horaires atypiques, isolement, pauses, déplacements, conciliation des temps et télétravail.</p><textarea rows={5} value={draft.workTime} onChange={(event) => updateDraft('workTime', event.target.value)} placeholder="Décrivez les contraintes de temps et d’organisation…" /></article>
          </div>
          <div className="duerp-panel"><h3>Points de vigilance spécifiques</h3><div className="duerp-form-grid two"><label>Grossesse, allaitement, fertilité ou santé reproductive<select value={draft.reproductiveImpact} onChange={(event) => updateDraft('reproductiveImpact', event.target.value)}><option>À questionner</option><option>Non concerné selon les éléments connus</option><option>Oui, à approfondir</option><option>Mesure d’aménagement à prévoir</option></select></label><label>VSST ou agissements sexistes<select value={draft.vsstRisk} onChange={(event) => updateDraft('vsstRisk', event.target.value)}><option>À questionner</option><option>Non identifié</option><option>Facteurs organisationnels possibles</option><option>Risque identifié</option></select></label><label>Conclusion de l’analyse<select value={draft.differentialFinding} onChange={(event) => updateDraft('differentialFinding', event.target.value)}><option>À approfondir</option><option>Exposition comparable selon les éléments recueillis</option><option>Exposition ou impact différencié identifié</option><option>Données insuffisantes</option></select></label><label>Argumentation synthétique<textarea rows={4} value={draft.differentialArgument} onChange={(event) => updateDraft('differentialArgument', event.target.value)} placeholder="Expliquez les données, observations et échanges qui fondent votre conclusion." /></label></div></div>
          <div className="duerp-stage-actions"><button className="text-button" onClick={() => setStep(2)}>← Identifier</button><button className="button primary" onClick={() => setStep(4)}>Coter le risque <span>→</span></button></div>
        </div>}

        {step === 4 && <div className="duerp-stage">
          <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 4 · Coter</p><h2>Évaluer et justifier</h2></div><p>La cotation ne remplace pas le débat : chaque valeur doit être justifiée à partir du travail réel.</p></div>
          <div className="duerp-score-layout"><div className="duerp-panel"><h3>Probabilité et gravité</h3><label>Probabilité / fréquence<select value={draft.probability} onChange={(event) => updateDraft('probability', event.target.value)}><option value="">Choisir</option>{probabilityOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Justification<textarea rows={4} value={draft.probabilityArgument} onChange={(event) => updateDraft('probabilityArgument', event.target.value)} placeholder="Fréquence d’exposition, incidents, retours salariés…" /></label><label>Gravité du dommage<select value={draft.gravity} onChange={(event) => updateDraft('gravity', event.target.value)}><option value="">Choisir</option>{gravityOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Justification<textarea rows={4} value={draft.gravityArgument} onChange={(event) => updateDraft('gravityArgument', event.target.value)} placeholder="Nature et réversibilité des dommages possibles…" /></label></div><aside className="duerp-score-card"><span>Risque résiduel</span><strong className={score.residual ? levelClass(score.residual) : ''}>{score.residual ? String(score.residual).replace('.', ',') : '—'}</strong><h3>{score.residual ? levelFor(score.residual) : 'À calculer'}</h3><dl><div><dt>Risque brut</dt><dd>{score.brut || '—'}</dd></div><div><dt>Maîtrise</dt><dd>{String(score.mastery).replace('.', ',')}</dd></div></dl><p>Risque brut = probabilité × gravité<br />Risque résiduel = risque brut × maîtrise</p></aside></div>
          <div className="duerp-panel"><div className="duerp-panel-title"><div><h3>Mesures de prévention existantes</h3><p>Une mesure par ligne. Le coefficient de maîtrise est calculé automatiquement selon la méthode Tatwin.</p></div><span>{splitMeasures(draft.measures).length} mesure{splitMeasures(draft.measures).length > 1 ? 's' : ''}</span></div><label>Mesures techniques, organisationnelles et humaines<textarea rows={7} value={draft.measures} onChange={(event) => updateDraft('measures', event.target.value)} placeholder={'Ex. Protection collective installée\nRotation organisée\nFormation réalisée'} /></label><label>Action complémentaire proposée par le CSE<textarea rows={4} value={draft.proposedAction} onChange={(event) => updateDraft('proposedAction', event.target.value)} placeholder="Quelle mesure permettrait de combattre le risque à la source ?" /></label></div>
          <div className="duerp-stage-actions"><button className="text-button" onClick={() => setStep(3)}>← Différencier</button><button className="button primary" onClick={() => setStep(5)}>Prévisualiser le DUERP <span>→</span></button></div>
        </div>}

        {step === 5 && <div className="duerp-stage">
          <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 5 · Formaliser</p><h2>Construire la proposition DUERP-CSE</h2></div><p>Relisez la ligne, ajoutez-la au document puis recommencez pour les autres risques de l’unité.</p></div>
          <div className="duerp-preview-card"><div className="duerp-preview-head"><div><span>{editingId ? 'Ligne en modification' : 'Ligne prête à enregistrer'}</span><h3>{draft.family || 'Risque à préciser'}</h3></div><div className={`duerp-preview-score ${score.residual ? levelClass(score.residual) : ''}`}><strong>{score.residual || '—'}</strong><span>{score.residual ? levelFor(score.residual) : 'Non coté'}</span></div></div><div className="duerp-preview-grid"><div><span>Unité</span><p>{meta.unit || 'À préciser'}</p></div><div><span>Situation réelle</span><p>{draft.activity || 'À préciser'}</p></div><div><span>Danger → évènement redouté</span><p>{draft.danger || 'À préciser'} → {draft.fearedEvent || 'à préciser'}</p></div><div><span>Analyse différenciée</span><p>{draft.differentialFinding} · {draft.differentialArgument || 'Argumentation à compléter'}</p></div><div><span>Mesures existantes</span><p>{splitMeasures(draft.measures).join(' · ') || 'Aucune mesure déclarée'}</p></div><div><span>Action proposée</span><p>{draft.proposedAction || 'À compléter'}</p></div></div><button className="button primary" onClick={saveRisk}>{editingId ? 'Mettre à jour cette ligne' : 'Ajouter cette analyse au DUERP-CSE'}</button></div>

          <div className="duerp-panel"><div className="duerp-panel-title"><div><h3>Lignes enregistrées</h3><p>Chaque ligne correspond à un risque analysé dans une unité de travail.</p></div><span>{risks.length} risque{risks.length > 1 ? 's' : ''}</span></div>{risks.length ? <div className="duerp-records">{risks.map((risk) => <article key={risk.id}><div className={`duerp-record-score ${levelClass(risk.residual)}`}><strong>{risk.residual}</strong><span>{levelFor(risk.residual)}</span></div><div><span>{risk.riskNo} · {risk.unit}</span><h4>{risk.family}</h4><p>{risk.activity}</p></div><div className="duerp-record-actions"><button onClick={() => editRisk(risk)}>Modifier</button><button className="danger" onClick={() => deleteRisk(risk.id)}>Supprimer</button></div></article>)}</div> : <div className="duerp-empty">Aucune ligne enregistrée pour le moment.</div>}</div>

          <div className="duerp-report-panel"><div><p className="eyebrow">Document de sortie</p><h3>Une proposition complète à présenter en formation</h3><p>Le PDF reprend le cadre, les données sexuées, chaque analyse différenciée, les cotations et les actions proposées.</p></div><div><button className="text-button light" onClick={newRisk}>+ Analyser un autre risque</button><button className="button primary" onClick={downloadPdf} disabled={isGenerating}>{isGenerating ? 'Création du PDF…' : 'Télécharger le DUERP-CSE en PDF'}</button></div></div>
          <div className="duerp-responsibility"><strong>À retenir</strong><p>Cette production constitue un support d’analyse et une proposition du CSE. Elle ne se substitue pas au DUERP établi et mis à jour sous la responsabilité de l’employeur.</p><a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023795562" target="_blank" rel="noreferrer">Article R. 4121-1 ↗</a></div>
          <div className="duerp-stage-actions"><button className="text-button" onClick={() => setStep(4)}>← Revoir la cotation</button><a href="/">Retour aux ateliers</a></div>
        </div>}
      </section>

      <footer className="footer"><div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div><p>Un outil pédagogique simple pour apprendre en faisant.</p><a href="#top">Retour en haut ↑</a></footer>
    </main>
  );
}
