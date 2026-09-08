'use client';
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useRef, useState } from 'react';

type WorkshopMeta = { unit: string; job: string };
type RiskDraft = {
  activity: string; source: string; nature: string; family: string; analysisElements: string; danger: string; fearedEvent: string;
  womenExposed: string; menExposed: string; taskDistribution: string; equipmentAdaptation: string; workTime: string;
  reproductiveImpact: string; vsstRisk: string; differentialFinding: string; differentialArgument: string;
  probability: string; probabilityArgument: string; gravity: string; gravityArgument: string; measures: string; noMeasuresDeclared: boolean;
};
export type DuerpRiskRecord = RiskDraft & {
  id: string; riskNo: string; unit: string; job: string; brut: number; mastery: number; residual: number;
};
type MainStep = 1 | 2 | 3 | 4 | 5;

export const DUERP_STORAGE_KEY = 'cse-duerp-pedagogique-v2';
const LEGACY_STORAGE_KEY = 'cse-duerp-differencie-v1';
const initialMeta: WorkshopMeta = { unit: '', job: '' };
const initialDraft: RiskDraft = {
  activity: '', source: 'Analyse CSE', nature: 'Nouveau risque proposé par le CSE', family: '', analysisElements: '', danger: '', fearedEvent: '',
  womenExposed: '', menExposed: '', taskDistribution: '', equipmentAdaptation: '', workTime: '', reproductiveImpact: 'À questionner', vsstRisk: 'À questionner',
  differentialFinding: 'À approfondir', differentialArgument: '', probability: '', probabilityArgument: '', gravity: '', gravityArgument: '', measures: '', noMeasuresDeclared: false,
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
  ['1', 'F1 · Très peu probable — exceptionnel'], ['2', 'F2 · Peu probable — annuel'],
  ['3', 'F3 · Probable — occasionnel ou mensuel'], ['4', 'F4 · Très probable — régulier ou hebdomadaire'],
];
const gravityOptions = [
  ['1', 'G1 · Faible — atteinte bénigne ou sans arrêt'], ['2', 'G2 · Moyenne — arrêt et dommages réversibles'],
  ['3', 'G3 · Grave — dommages irréversibles'], ['4', 'G4 · Très grave — dommages importants ou décès'],
];
const makeId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const splitMeasures = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const masteryFromMeasures = (value: string) => {
  const count = splitMeasures(value).length;
  if (count <= 1) return 1;
  if (count === 2) return 0.75;
  if (count === 3) return 0.5;
  return 0.25;
};
const masteryLabel = (value: number) => value === 1 ? 'Maîtrise nulle ou insuffisante' : value === 0.75 ? 'Maîtrise faible' : value === 0.5 ? 'Maîtrise partielle' : 'Maîtrise forte';
const roundOne = (value: number) => Math.round(value * 10) / 10;
const levelFor = (score: number) => score <= 1 ? 'Faible' : score <= 3 ? 'Modéré' : score <= 8 ? 'Élevé' : 'Critique';
const levelClass = (score: number) => score <= 1 ? 'low' : score <= 3 ? 'medium' : score <= 8 ? 'high' : 'critical';
const formatNumber = (value: number | string) => String(value || '—').replace('.', ',');

export default function DuerpWorkshop() {
  const [step, setStep] = useState<MainStep>(1);
  const [meta, setMeta] = useState<WorkshopMeta>(initialMeta);
  const [draft, setDraft] = useState<RiskDraft>(initialDraft);
  const [risks, setRisks] = useState<DuerpRiskRecord[]>([]);
  const [editingId, setEditingId] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [savedLabel, setSavedLabel] = useState('Sauvegarde locale active');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [measureInput, setMeasureInput] = useState('');
  const measureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(DUERP_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { meta?: Record<string, unknown>; draft?: Partial<RiskDraft>; risks?: Array<Partial<DuerpRiskRecord>> };
          const legacyJob = String(parsed.meta?.job || parsed.meta?.jobs || '');
          setMeta({ unit: String(parsed.meta?.unit || ''), job: legacyJob });
          if (parsed.draft) setDraft({ ...initialDraft, ...parsed.draft });
          if (Array.isArray(parsed.risks)) setRisks(parsed.risks.map((risk, index) => ({
            ...initialDraft, ...risk, id: String(risk.id || makeId()), riskNo: String(risk.riskNo || `R-${String(index + 1).padStart(3, '0')}`),
            unit: String(risk.unit || parsed.meta?.unit || ''), job: String(risk.job || legacyJob), brut: Number(risk.brut || 0), mastery: Number(risk.mastery ?? 1), residual: Number(risk.residual || 0),
          })));
        }
      } catch { setSavedLabel('Sauvegarde indisponible'); } finally { setHydrated(true); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(DUERP_STORAGE_KEY, JSON.stringify({ meta, draft, risks })); setSavedLabel('Enregistré sur cet appareil'); }
      catch { setSavedLabel('Sauvegarde indisponible'); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [meta, draft, risks, hydrated]);

  const probability = Number(draft.probability);
  const gravity = Number(draft.gravity);
  const mastery = masteryFromMeasures(draft.measures);
  const brut = probability && gravity ? roundOne(probability * gravity) : 0;
  const residual = brut ? roundOne(brut * mastery) : 0;
  const score = { brut, mastery, residual };
  const women = Number(draft.womenExposed || 0);
  const men = Number(draft.menExposed || 0);
  const mixity = !women && !men ? 'À questionner' : women === men ? 'Mixte' : women > men ? 'Majoritairement féminine' : 'Majoritairement masculine';
  const currentRiskNumber = risks.find((risk) => risk.id === editingId)?.riskNo || `R-${String(risks.length + 1).padStart(3, '0')}`;
  const measures = splitMeasures(draft.measures);

  const updateDraft = <K extends keyof RiskDraft>(field: K, value: RiskDraft[K]) => setDraft((current) => ({ ...current, [field]: value }));
  const goTo = (next: MainStep) => {
    setStep(next);
    window.requestAnimationFrame(() => document.querySelector('.duerp-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const addMeasure = () => {
    const measure = (measureInputRef.current?.value || measureInput).trim();
    if (!measure) { setMessage('Décrivez la mesure existante avant de l’ajouter.'); return; }
    const nextMeasures = [...measures, measure];
    setDraft((current) => ({ ...current, measures: nextMeasures.join('\n'), noMeasuresDeclared: false }));
    setMeasureInput('');
    setMessage(`Mesure ajoutée : le coefficient de maîtrise est maintenant ${formatNumber(masteryFromMeasures(nextMeasures.join('\n')))}.`);
  };
  const removeMeasure = (index: number) => {
    const nextMeasures = measures.filter((_, itemIndex) => itemIndex !== index);
    setDraft((current) => ({ ...current, measures: nextMeasures.join('\n'), noMeasuresDeclared: false }));
    setMessage('La mesure a été retirée et la cotation recalculée.');
  };
  const declareNoMeasures = () => {
    setDraft((current) => ({ ...current, measures: '', noMeasuresDeclared: true }));
    setMeasureInput('');
    setMessage('Aucune mesure existante déclarée : le coefficient de maîtrise est égal à 1.');
  };
  const saveRisk = () => {
    const missing = [meta.unit, meta.job, draft.activity, draft.family, draft.danger, draft.fearedEvent, draft.probability, draft.gravity].some((value) => !String(value).trim());
    if (missing) { setMessage('Complétez l’unité, le métier, le travail réel, le risque, le danger, la fréquence et la gravité.'); return; }
    if (!measures.length && !draft.noMeasuresDeclared) { setMessage('Ajoutez les mesures existantes ou confirmez qu’aucune mesure n’est en place.'); return; }
    const previous = risks.find((risk) => risk.id === editingId);
    const record: DuerpRiskRecord = { ...draft, id: editingId || makeId(), riskNo: previous?.riskNo || currentRiskNumber, unit: meta.unit, job: meta.job, ...score };
    setRisks((current) => editingId ? current.map((risk) => risk.id === editingId ? record : risk) : [...current, record]);
    setEditingId(record.id);
    setMessage(`${record.riskNo} est enregistré dans le tableau pédagogique.`);
  };
  const editRisk = (risk: DuerpRiskRecord) => {
    const { id, riskNo: _riskNo, unit, job, brut: _brut, mastery: _mastery, residual: _residual, ...values } = risk;
    void _riskNo; void _brut; void _mastery; void _residual;
    setMeta({ unit, job }); setDraft(values); setEditingId(id); setMeasureInput(''); setMessage(`Modification de ${risk.riskNo}.`); goTo(2);
  };
  const deleteRisk = (id: string) => {
    const risk = risks.find((item) => item.id === id);
    if (!risk || !window.confirm(`Supprimer ${risk.riskNo} ?`)) return;
    setRisks((current) => current.filter((item) => item.id !== id));
    if (editingId === id) setEditingId('');
    setMessage(`${risk.riskNo} a été retiré.`);
  };
  const newRisk = () => { setDraft(initialDraft); setEditingId(''); setMeasureInput(''); setMessage('Nouvelle ligne prête.'); goTo(2); };
  const resetWorkshop = () => {
    if (!window.confirm('Réinitialiser entièrement l’atelier DUERP ?')) return;
    localStorage.removeItem(DUERP_STORAGE_KEY); localStorage.removeItem(LEGACY_STORAGE_KEY);
    setMeta(initialMeta); setDraft(initialDraft); setRisks([]); setEditingId(''); setMeasureInput(''); setMessage('Atelier réinitialisé.'); goTo(1);
  };

  const riskContext = () => <section className="duerp-context-board" aria-label="Risque en cours d’analyse">
    <div className="duerp-context-heading"><span>Fil rouge de l’analyse</span><strong>{currentRiskNumber}</strong></div>
    <div className="duerp-context-grid">
      <div><small>Unité et métier</small><strong>{meta.unit || 'Unité à préciser'}</strong><p>{meta.job || 'Métier à préciser'}</p></div>
      <div><small>Risque identifié</small><strong>{draft.family || 'Risque à préciser'}</strong><p>{draft.fearedEvent || 'Évènement redouté à préciser'}</p></div>
      <div className="danger"><small>Danger identifié</small><strong>{draft.danger || 'Danger à préciser'}</strong><p>{draft.activity || 'Travail réel à préciser'}</p></div>
    </div>
  </section>;

  const riskTable = (rows: DuerpRiskRecord[], includeActions: boolean) => <div className="duerp-final-table-wrap"><table className="duerp-final-table">
    <thead><tr><th>N°</th><th>Unité</th><th>Métier</th><th>Risque identifié</th><th>Danger identifié</th><th>Situation dangereuse / évènement</th><th>Activité réelle</th><th>Fréquence</th><th>Gravité</th><th>Risque brut</th><th>Mesures existantes</th><th>Maîtrise</th><th>Risque résiduel</th><th>Analyse différenciée</th>{includeActions ? <th>Actions</th> : null}</tr></thead>
    <tbody>{rows.length ? rows.map((risk) => <tr key={risk.id}>
      <td><strong>{risk.riskNo}</strong></td><td>{risk.unit}</td><td>{risk.job}</td><td>{risk.family}</td><td>{risk.danger}</td><td>{risk.fearedEvent}</td><td>{risk.activity}</td><td>{risk.probability}</td><td>{risk.gravity}</td>
      <td><span className={`duerp-table-score ${levelClass(risk.brut)}`}>{formatNumber(risk.brut)}</span></td><td>{splitMeasures(risk.measures).join(' · ') || 'Aucune'}</td><td>{formatNumber(risk.mastery)}<small>{masteryLabel(risk.mastery)}</small></td>
      <td><span className={`duerp-table-score ${levelClass(risk.residual)}`}>{formatNumber(risk.residual)}<small>{levelFor(risk.residual)}</small></span></td><td>{risk.differentialFinding}<small>{risk.differentialArgument}</small></td>
      {includeActions ? <td><div className="duerp-table-actions"><button type="button" onClick={() => editRisk(risk)}>Modifier</button><a href="/ateliers/plan-action">Plan d’action</a><button className="danger" type="button" onClick={() => deleteRisk(risk.id)}>Supprimer</button></div></td> : null}
    </tr>) : <tr><td className="duerp-table-empty" colSpan={includeActions ? 15 : 14}>Aucune ligne enregistrée.</td></tr>}</tbody>
  </table></div>;

  const downloadPdf = async () => {
    if (!risks.length) { setMessage('Enregistrez au moins une ligne avant de créer le PDF.'); return; }
    setIsGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
      const width = pdf.internal.pageSize.getWidth(); const height = pdf.internal.pageSize.getHeight(); const margin = 12; let y = 17; let page = 1;
      const footer = () => { pdf.setFontSize(7); pdf.setTextColor(90, 105, 99); pdf.text('Atelier pédagogique DUERP-CSE', margin, height - 7); pdf.text(`Page ${page}`, width - margin, height - 7, { align: 'right' }); };
      const newPage = () => { footer(); pdf.addPage(); page += 1; y = 15; };
      const text = (value: string, maxWidth: number) => pdf.splitTextToSize(value || '—', maxWidth) as string[];
      pdf.setFillColor(15, 82, 61); pdf.rect(0, 0, width, 42, 'F'); pdf.setTextColor(223, 241, 106); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.text('SUPPORT DE FORMATION · DOCUMENT UNIQUE', margin, 14);
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(22); pdf.text('Tableau pédagogique DUERP-CSE', margin, 28); y = 52;
      risks.forEach((risk, index) => {
        if (index && y > height - 72) newPage();
        pdf.setFillColor(239, 244, 240); pdf.roundedRect(margin, y - 6, width - margin * 2, 10, 2, 2, 'F'); pdf.setTextColor(22, 52, 43); pdf.setFontSize(12); pdf.text(`${risk.riskNo} · ${risk.family}`, margin + 4, y); y += 10;
        const fields = [
          ['Unité / métier', `${risk.unit} · ${risk.job}`], ['Travail réel', risk.activity], ['Danger', risk.danger], ['Évènement redouté', risk.fearedEvent],
          ['Cotation', `Fréquence ${risk.probability} × gravité ${risk.gravity} = risque brut ${formatNumber(risk.brut)} · maîtrise ${formatNumber(risk.mastery)} · risque résiduel ${formatNumber(risk.residual)} (${levelFor(risk.residual)})`],
          ['Mesures existantes', splitMeasures(risk.measures).join(' · ') || 'Aucune'], ['Analyse différenciée', `${risk.differentialFinding} · ${risk.differentialArgument || 'À compléter'}`],
        ];
        fields.forEach(([label, value]) => { const lines = text(value, width - margin * 2 - 42); if (y + lines.length * 4 + 7 > height - 14) newPage(); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); pdf.text(label, margin, y); pdf.setFont('helvetica', 'normal'); pdf.text(lines, margin + 39, y); y += Math.max(6, lines.length * 4 + 2); });
        y += 4;
      });
      footer(); pdf.save('atelier-pedagogique-duerp-cse.pdf'); setMessage('Le document PDF a été généré.');
    } finally { setIsGenerating(false); }
  };

  return <main className="duerp-page" id="top">
    <header className="site-header"><a className="brand" href="/" aria-label="Retour à l’accueil"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a><div className="duerp-header-actions"><button type="button" onClick={resetWorkshop}>Réinitialiser</button><a className="header-link" href="/">Tous les ateliers</a></div></header>
    <section className="duerp-hero"><div><p className="eyebrow">Atelier 05 · DUERP-CSE</p><h1>Voir le risque, puis le coter.</h1><p>Un parcours collectif en cinq étapes pour partir du travail réel et construire une ligne de document unique compréhensible par tous.</p></div><aside className="duerp-legal-note"><span>Objectif pédagogique</span><strong>Conserver le même risque comme fil rouge, de son identification jusqu’à sa formalisation.</strong></aside></section>
    <nav className="duerp-steps" aria-label="Étapes de l’atelier">{[[1, 'Cadrer'], [2, 'Identifier'], [3, 'Différencier'], [4, 'Coter'], [5, 'Formaliser']].map(([number, label]) => <button type="button" key={number} className={step === number ? 'active' : step > Number(number) ? 'done' : ''} onClick={() => goTo(Number(number) as MainStep)}><span>{number}</span><strong>{label}</strong></button>)}<p>{savedLabel}</p></nav>
    <section className="duerp-workspace">
      {message ? <div className="duerp-message" role="status"><span>{message}</span><button type="button" onClick={() => setMessage('')} aria-label="Fermer">×</button></div> : null}
      {step === 1 ? <div className="duerp-stage">
        <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 1 · Cadrer</p><h2>Définir le terrain d’analyse</h2></div><p>Le groupe choisit une unité de travail et un métier. Aucun effectif n’est nécessaire pour démarrer.</p></div>
        <div className="duerp-framing-card"><div><span>01</span><label>Unité de travail<input value={meta.unit} onChange={(event) => setMeta((current) => ({ ...current, unit: event.target.value }))} placeholder="Ex. Accueil, atelier, interventions extérieures…" /></label></div><div><span>02</span><label>Métier concerné<input value={meta.job} onChange={(event) => setMeta((current) => ({ ...current, job: event.target.value }))} placeholder="Ex. Agent d’accueil, technicien…" /></label></div></div>
        <div className="duerp-stage-actions"><a href="/">Quitter</a><button className="button primary" type="button" onClick={() => { if (!meta.unit.trim() || !meta.job.trim()) { setMessage('Renseignez l’unité et le métier.'); return; } goTo(2); }}>Identifier un risque <span>→</span></button></div>
      </div> : null}
      {step === 2 ? <div className="duerp-stage">
        <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 2 · Identifier</p><h2>Trois regards sur une même situation</h2></div><p>Chaque bloc correspond à une étape du raisonnement : le travail réel, le risque, puis le danger.</p></div>
        <section className="duerp-identify-section work"><header><span>01</span><div><small>Section</small><h3>Travail réel</h3><p>Décrire ce que la personne fait vraiment, dans quelles conditions et comment le risque a été repéré.</p></div></header><label>Situation, poste ou activité de travail réelle<textarea rows={5} value={draft.activity} onChange={(event) => updateDraft('activity', event.target.value)} placeholder="Décrivez précisément l’activité réelle du salarié…" /></label><div className="duerp-form-grid two"><label>Comment le risque a-t-il été identifié ?<select value={draft.source} onChange={(event) => updateDraft('source', event.target.value)}><option>Analyse CSE</option><option>Inspection du CSE</option><option>Accident du travail</option><option>Enquête AT/MP</option><option>Incident / presque accident</option><option>Consultation</option><option>Réclamation</option><option>Droit d’alerte</option><option>Retour salarié</option><option>Autre</option></select></label><label>Nature de la proposition<select value={draft.nature} onChange={(event) => updateDraft('nature', event.target.value)}><option>Nouveau risque proposé par le CSE</option><option>Mise à jour d’un risque existant dans le DUERP de l’entreprise</option><option>À vérifier dans le DUERP de l’entreprise</option></select></label></div></section>
        <section className="duerp-identify-section risk"><header><span>02</span><div><small>Section</small><h3>Risque</h3><p>Nommer la famille de risque et rassembler les faits qui permettent de l’étayer.</p></div></header><label>Famille de risque<select value={draft.family} onChange={(event) => updateDraft('family', event.target.value)}><option value="">Choisir une famille</option>{riskFamilies.map((family) => <option key={family}>{family}</option>)}</select></label><label>Autres éléments recueillis<textarea rows={5} value={draft.analysisElements} onChange={(event) => updateDraft('analysisElements', event.target.value)} placeholder="Observations, incidents, retours, données ou documents disponibles…" /></label></section>
        <section className="duerp-identify-section danger"><header><span>03</span><div><small>Section</small><h3>Danger</h3><p>Identifier la source possible du dommage et la situation dangereuse concrète.</p></div></header><label>Quelle est la source possible du dommage ?<textarea rows={5} value={draft.danger} onChange={(event) => updateDraft('danger', event.target.value)} placeholder="Décrivez le danger, l’exposition ou l’écart avec le travail prescrit…" /></label><label>Situation dangereuse ou évènement redouté<input value={draft.fearedEvent} onChange={(event) => updateDraft('fearedEvent', event.target.value)} placeholder="Ex. chute, heurt, exposition, agression, épuisement…" /></label></section>
        <div className="duerp-stage-actions"><button className="text-button" type="button" onClick={() => goTo(1)}>← Cadrer</button><button className="button primary" type="button" onClick={() => goTo(3)}>Différencier les expositions <span>→</span></button></div>
      </div> : null}
      {step === 3 ? <div className="duerp-stage">
        <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 3 · Différencier</p><h2>Questionner les écarts d’exposition</h2></div><p>Le risque et le danger restent visibles pendant toute l’analyse.</p></div>{riskContext()}
        <div className="duerp-panel"><div className="duerp-panel-title"><div><h3>Population réellement exposée</h3><p>Indiquez les personnes exposées à ce risque précis.</p></div><span className="mixity-chip">{mixity}</span></div><div className="duerp-form-grid two"><label>Femmes exposées<input type="number" min="0" value={draft.womenExposed} onChange={(event) => updateDraft('womenExposed', event.target.value)} placeholder="0" /></label><label>Hommes exposés<input type="number" min="0" value={draft.menExposed} onChange={(event) => updateDraft('menExposed', event.target.value)} placeholder="0" /></label></div></div>
        <div className="duerp-question-grid"><article><span>01</span><h3>Qui fait quoi, réellement ?</h3><p>Rotation, polyvalence, activités invisibles ou physiquement exigeantes.</p><textarea rows={5} value={draft.taskDistribution} onChange={(event) => updateDraft('taskDistribution', event.target.value)} /></article><article><span>02</span><h3>Le matériel convient-il à toutes et tous ?</h3><p>Poste, EPI, outils, port de charges et accès aux commandes.</p><textarea rows={5} value={draft.equipmentAdaptation} onChange={(event) => updateDraft('equipmentAdaptation', event.target.value)} /></article><article><span>03</span><h3>Les temps exposent-ils différemment ?</h3><p>Horaires, isolement, pauses, déplacements et organisation.</p><textarea rows={5} value={draft.workTime} onChange={(event) => updateDraft('workTime', event.target.value)} /></article></div>
        <div className="duerp-panel"><h3>Points de vigilance et conclusion</h3><div className="duerp-form-grid two"><label>Grossesse, allaitement, fertilité ou santé reproductive<select value={draft.reproductiveImpact} onChange={(event) => updateDraft('reproductiveImpact', event.target.value)}><option>À questionner</option><option>Non concerné selon les éléments connus</option><option>Oui, à approfondir</option><option>Mesure d’aménagement à prévoir</option></select></label><label>VSST ou agissements sexistes<select value={draft.vsstRisk} onChange={(event) => updateDraft('vsstRisk', event.target.value)}><option>À questionner</option><option>Non identifié</option><option>Facteurs organisationnels possibles</option><option>Risque identifié</option></select></label><label>Conclusion de l’analyse<select value={draft.differentialFinding} onChange={(event) => updateDraft('differentialFinding', event.target.value)}><option>À approfondir</option><option>Exposition comparable selon les éléments recueillis</option><option>Exposition ou impact différencié identifié</option><option>Données insuffisantes</option></select></label><label>Argumentation synthétique<textarea rows={4} value={draft.differentialArgument} onChange={(event) => updateDraft('differentialArgument', event.target.value)} /></label></div></div>
        <div className="duerp-stage-actions"><button className="text-button" type="button" onClick={() => goTo(2)}>← Identifier</button><button className="button primary" type="button" onClick={() => goTo(4)}>Coter le risque <span>→</span></button></div>
      </div> : null}
      {step === 4 ? <div className="duerp-stage">
        <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 4 · Coter</p><h2>Rendre le niveau de risque visible</h2></div><p>Les couleurs aident le groupe à repérer immédiatement les risques à traiter en priorité.</p></div>{riskContext()}
        <div className="duerp-rating-workbench"><section className="duerp-rating-inputs"><h3>1. Calculer le risque brut</h3><div className="duerp-form-grid two"><label>Niveau de fréquence<select value={draft.probability} onChange={(event) => updateDraft('probability', event.target.value)}><option value="">Choisir</option>{probabilityOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Niveau de gravité<select value={draft.gravity} onChange={(event) => updateDraft('gravity', event.target.value)}><option value="">Choisir</option>{gravityOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div><div className="duerp-form-grid two"><label>Justifier la fréquence<textarea rows={4} value={draft.probabilityArgument} onChange={(event) => updateDraft('probabilityArgument', event.target.value)} /></label><label>Justifier la gravité<textarea rows={4} value={draft.gravityArgument} onChange={(event) => updateDraft('gravityArgument', event.target.value)} /></label></div></section>
          <aside className="duerp-rating-results"><div className={`duerp-score-block ${score.brut ? levelClass(score.brut) : 'empty'}`}><span>Risque brut</span><strong>{formatNumber(score.brut)}</strong><small>{score.brut ? levelFor(score.brut) : 'À calculer'}</small></div><div className="duerp-score-block mastery"><span>Maîtrise</span><strong>{formatNumber(score.mastery)}</strong><small>{masteryLabel(score.mastery)}</small></div><div className={`duerp-score-block ${score.residual ? levelClass(score.residual) : 'empty'}`}><span>Risque résiduel</span><strong>{formatNumber(score.residual)}</strong><small>{score.residual ? levelFor(score.residual) : 'À calculer'}</small></div></aside>
        </div>
        <div className="duerp-formulas"><div><span>Risque brut</span><strong>Fréquence × Gravité</strong><b>{draft.probability || '—'} × {draft.gravity || '—'} = {formatNumber(score.brut)}</b></div><div><span>Risque résiduel</span><strong>Risque brut × Maîtrise</strong><b>{formatNumber(score.brut)} × {formatNumber(score.mastery)} = {formatNumber(score.residual)}</b></div></div>
        <section className="duerp-measures-panel"><header><div><small>2. Évaluer la maîtrise</small><h3>Mesures actuellement en place</h3><p>Ajoutez chaque mesure séparément : la maîtrise et le risque résiduel se recalculent automatiquement.</p></div><strong>{measures.length}</strong></header><div className="duerp-measure-entry"><label>Mesure existante<input ref={measureInputRef} value={measureInput} onChange={(event) => setMeasureInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addMeasure(); } }} placeholder="Ex. aspiration à la source" /></label><button className="button duerp-add-measure" type="button" onClick={addMeasure}>Ajouter</button></div><button className="text-button duerp-no-measure" type="button" onClick={declareNoMeasures}>Aucune mesure n’est actuellement en place</button><div className={`duerp-measure-list ${draft.noMeasuresDeclared ? 'declared-none' : ''}`}>{measures.length ? measures.map((measure, index) => <div key={`${measure}-${index}`}><span><small>Mesure {index + 1}</small><strong>{measure}</strong></span><button type="button" onClick={() => removeMeasure(index)}>Retirer</button></div>) : <p>{draft.noMeasuresDeclared ? 'Aucune mesure existante confirmée.' : 'Aucune mesure ajoutée.'}</p>}</div><div className="duerp-mastery-scale">{[['0 ou 1 mesure', 1], ['2 mesures', .75], ['3 mesures', .5], ['4 mesures ou plus', .25]].map(([label, coefficient]) => <div key={String(label)} className={score.mastery === coefficient ? 'active' : ''}><span>{label}</span><strong>{String(coefficient).replace('.', ',')}</strong></div>)}</div></section>
        <div className="duerp-stage-actions"><button className="text-button" type="button" onClick={() => goTo(3)}>← Différencier</button><button className="button primary" type="button" onClick={() => goTo(5)}>Formaliser la ligne <span>→</span></button></div>
      </div> : null}
      {step === 5 ? <div className="duerp-stage">
        <div className="duerp-stage-heading"><div><p className="eyebrow">Étape 5 · Formaliser</p><h2>Construire le tableau DUERP</h2></div><p>Chaque information utile est placée dans une colonne, comme dans l’application Tatwin.</p></div>{riskContext()}
        <section className="duerp-draft-table"><header><div><span>Ligne prête à enregistrer</span><h3>{currentRiskNumber}</h3></div><button className="button primary" type="button" onClick={saveRisk}>{editingId ? 'Mettre à jour la ligne' : 'Enregistrer cette ligne'}</button></header>{riskTable([{ ...draft, id: 'draft', riskNo: currentRiskNumber, unit: meta.unit, job: meta.job, ...score }], false)}</section>
        <section className="duerp-saved-table"><div className="duerp-panel-title"><div><h3>Lignes enregistrées</h3><p>Ces risques seront proposés dans l’atelier Plan d’action.</p></div><span>{risks.length} ligne{risks.length > 1 ? 's' : ''}</span></div>{riskTable(risks, true)}</section>
        <div className="duerp-report-panel"><div><p className="eyebrow">Document pédagogique</p><h3>Imprimer le tableau construit par le groupe</h3><p>Le PDF reprend le travail réel, le danger, le risque, les cotations, les mesures et l’analyse différenciée.</p></div><div><button className="text-button light" type="button" onClick={newRisk}>+ Analyser un autre risque</button><button className="button primary" type="button" onClick={downloadPdf} disabled={isGenerating}>{isGenerating ? 'Création…' : 'Télécharger le PDF'}</button><a className="button duerp-action-link" href="/ateliers/plan-action">Ouvrir l’atelier Plan d’action →</a></div></div>
      </div> : null}
    </section>
  </main>;
}
