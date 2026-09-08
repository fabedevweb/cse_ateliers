'use client';
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from 'react';
import type { DuerpRiskRecord } from './duerp-workshop';

type PrincipleDecision = 'retained' | 'not-retained' | '';
type PrincipleAnswer = { decision: PrincipleDecision; note: string };
type ActionPlan = {
  riskId: string;
  principles: Record<number, PrincipleAnswer>;
  action: string;
  priority: string;
  responsible: string;
  definedOn: string;
  dueOn: string;
  means: string;
  reviewOn: string;
  contributors: string;
  firstMilestone: string;
  obstacles: string;
  implementationIndicator: string;
  successIndicator: string;
  status: string;
};
type PlanStep = 1 | 2 | 3 | 4;

const DUERP_STORAGE_KEY = 'cse-duerp-pedagogique-v2';
const LEGACY_DUERP_STORAGE_KEY = 'cse-duerp-differencie-v1';
const PLAN_STORAGE_KEY = 'cse-plan-action-v1';
const principles = [
  { id: 1, title: 'Éviter les risques', question: 'Peut-on supprimer la situation dangereuse, l’exposition ou la tâche ?' },
  { id: 2, title: 'Évaluer les risques qui ne peuvent pas être évités', question: 'La cotation permet-elle de dimensionner et de prioriser l’action ?' },
  { id: 3, title: 'Combattre les risques à la source', question: 'L’action agit-elle directement sur la cause, le procédé, le matériel ou l’organisation ?' },
  { id: 4, title: 'Adapter le travail à l’être humain', question: 'Comment adapter le poste, les rythmes, les objectifs ou les méthodes au travail réel ?' },
  { id: 5, title: 'Tenir compte de l’évolution de la technique', question: 'Une solution technique plus sûre ou mieux adaptée est-elle disponible ?' },
  { id: 6, title: 'Remplacer ce qui est dangereux', question: 'Peut-on substituer le produit, l’équipement, le procédé ou le mode d’organisation dangereux ?' },
  { id: 7, title: 'Planifier la prévention', question: 'L’action articule-t-elle technique, organisation, moyens, calendrier et suivi ?' },
  { id: 8, title: 'Donner la priorité à la protection collective', question: 'La proposition protège-t-elle toutes les personnes exposées avant de dépendre d’un EPI ?' },
  { id: 9, title: 'Donner les instructions appropriées', question: 'Quelles consignes doivent accompagner l’action sans constituer l’unique mesure ?' },
] as const;
const emptyPrinciples = () => Object.fromEntries(principles.map((principle) => [principle.id, { decision: '', note: '' }])) as Record<number, PrincipleAnswer>;
const today = () => new Date().toISOString().slice(0, 10);
const newPlan = (riskId = ''): ActionPlan => ({
  riskId, principles: emptyPrinciples(), action: '', priority: '', responsible: '', definedOn: today(), dueOn: '', means: '', reviewOn: '',
  contributors: '', firstMilestone: '', obstacles: '', implementationIndicator: '', successIndicator: '', status: 'À lancer',
});
const levelFor = (score: number) => score <= 1 ? 'Faible' : score <= 3 ? 'Modéré' : score <= 8 ? 'Élevé' : 'Critique';
const levelClass = (score: number) => score <= 1 ? 'low' : score <= 3 ? 'medium' : score <= 8 ? 'high' : 'critical';
const formatNumber = (value: number | string) => String(value || '—').replace('.', ',');
const formatDate = (value: string) => value ? new Intl.DateTimeFormat('fr-FR').format(new Date(`${value}T12:00:00`)) : '—';

export default function PlanActionWorkshop() {
  const [step, setStep] = useState<PlanStep>(1);
  const [risks, setRisks] = useState<DuerpRiskRecord[]>([]);
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [draft, setDraft] = useState<ActionPlan>(newPlan());
  const [principleIndex, setPrincipleIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const duerpRaw = localStorage.getItem(DUERP_STORAGE_KEY) || localStorage.getItem(LEGACY_DUERP_STORAGE_KEY);
        if (duerpRaw) {
          const data = JSON.parse(duerpRaw) as { risks?: DuerpRiskRecord[] };
          if (Array.isArray(data.risks)) setRisks(data.risks);
        }
        const planRaw = localStorage.getItem(PLAN_STORAGE_KEY);
        if (planRaw) {
          const data = JSON.parse(planRaw) as { plans?: ActionPlan[] };
          if (Array.isArray(data.plans)) setPlans(data.plans.map((plan) => ({ ...newPlan(plan.riskId), ...plan, principles: { ...emptyPrinciples(), ...plan.principles } })));
        }
      } catch { setMessage('Les données enregistrées sur cet appareil ne peuvent pas être relues.'); }
      finally { setHydrated(true); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ plans })), 250);
    return () => window.clearTimeout(timer);
  }, [plans, hydrated]);

  const selectedRisk = risks.find((risk) => risk.id === draft.riskId);
  const retainedPrinciples = principles.filter((principle) => draft.principles[principle.id]?.decision === 'retained');
  const goTo = (next: PlanStep) => {
    setStep(next);
    window.requestAnimationFrame(() => document.querySelector('.action-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const chooseRisk = (risk: DuerpRiskRecord) => {
    const existing = plans.find((plan) => plan.riskId === risk.id);
    setDraft(existing ? { ...existing, principles: { ...emptyPrinciples(), ...existing.principles } } : newPlan(risk.id));
    setPrincipleIndex(0); setMessage(''); goTo(2);
  };
  const updatePrinciple = (id: number, change: Partial<PrincipleAnswer>) => setDraft((current) => ({
    ...current, principles: { ...current.principles, [id]: { ...current.principles[id], ...change } },
  }));
  const nextPrinciple = () => {
    const principle = principles[principleIndex]; const answer = draft.principles[principle.id];
    if (!answer?.decision || !answer.note.trim()) { setMessage('Choisissez une réponse et notez la conclusion du groupe.'); return; }
    setMessage('');
    if (principleIndex < principles.length - 1) setPrincipleIndex((current) => current + 1);
    else goTo(3);
  };
  const savePlan = () => {
    const principlesComplete = principles.every((principle) => draft.principles[principle.id]?.decision && draft.principles[principle.id]?.note.trim());
    const required = [draft.action, draft.priority, draft.responsible, draft.definedOn, draft.dueOn, draft.means, draft.reviewOn, draft.implementationIndicator, draft.successIndicator];
    if (!principlesComplete || required.some((value) => !value.trim())) { setMessage('Examinez les neuf principes et complétez tous les champs indispensables.'); return; }
    setPlans((current) => current.some((plan) => plan.riskId === draft.riskId) ? current.map((plan) => plan.riskId === draft.riskId ? draft : plan) : [...current, draft]);
    setMessage('Le plan d’action est enregistré dans le tableau.'); goTo(4);
  };
  const deletePlan = (riskId: string) => {
    if (!window.confirm('Supprimer ce plan d’action ?')) return;
    setPlans((current) => current.filter((plan) => plan.riskId !== riskId));
    if (draft.riskId === riskId) setDraft(newPlan());
    setMessage('Le plan d’action a été supprimé.');
  };
  const resetPlans = () => {
    if (!window.confirm('Réinitialiser tous les plans d’action ?')) return;
    localStorage.removeItem(PLAN_STORAGE_KEY); setPlans([]); setDraft(newPlan()); setPrincipleIndex(0); setMessage('Atelier Plan d’action réinitialisé.'); goTo(1);
  };

  const riskReminder = (risk: DuerpRiskRecord) => <section className="action-risk-reminder">
    <header><div><span>Risque issu du DUERP</span><h2>{risk.riskNo} · {risk.family}</h2></div><div className={`action-risk-score ${levelClass(risk.residual)}`}><strong>{formatNumber(risk.residual)}</strong><small>{levelFor(risk.residual)}</small></div></header>
    <div><p><small>Unité · métier</small><strong>{risk.unit} · {risk.job}</strong></p><p><small>Danger identifié</small><strong>{risk.danger}</strong></p><p><small>Travail réel</small><strong>{risk.activity}</strong></p></div>
  </section>;

  const planTable = () => <div className="action-table-wrap"><table className="action-plan-table"><thead><tr>
    <th>Risque</th><th>Danger</th><th>Action</th><th>Principes retenus</th><th>Priorité</th><th>Responsable</th><th>Définie le</th><th>Fin prévue</th><th>Moyens</th><th>Point d’étape</th><th>Personnes associées</th><th>Première étape</th><th>Freins anticipés</th><th>Indicateur de réalisation</th><th>Indicateur de réussite</th><th>Statut</th><th>Actions</th>
  </tr></thead><tbody>{plans.length ? plans.map((plan) => {
    const risk = risks.find((item) => item.id === plan.riskId);
    const retained = principles.filter((principle) => plan.principles[principle.id]?.decision === 'retained');
    return <tr key={plan.riskId}><td><strong>{risk?.riskNo || '—'}</strong><small>{risk?.family || 'Risque supprimé'}</small></td><td>{risk?.danger || '—'}</td><td>{plan.action}</td><td>{retained.map((principle) => `P${principle.id}`).join(' · ') || 'Aucun'}</td><td>{plan.priority}</td><td>{plan.responsible}</td><td>{formatDate(plan.definedOn)}</td><td>{formatDate(plan.dueOn)}</td><td>{plan.means}</td><td>{formatDate(plan.reviewOn)}</td><td>{plan.contributors || '—'}</td><td>{plan.firstMilestone || '—'}</td><td>{plan.obstacles || '—'}</td><td>{plan.implementationIndicator}</td><td>{plan.successIndicator}</td><td>{plan.status}</td><td><div><button type="button" onClick={() => risk && chooseRisk(risk)}>Modifier</button><button className="danger" type="button" onClick={() => deletePlan(plan.riskId)}>Supprimer</button></div></td></tr>;
  }) : <tr><td colSpan={17} className="duerp-table-empty">Aucun plan d’action enregistré.</td></tr>}</tbody></table></div>;

  const downloadPdf = async () => {
    if (!plans.length) { setMessage('Enregistrez au moins un plan avant de créer le PDF.'); return; }
    setIsGenerating(true);
    try {
      const { jsPDF } = await import('jspdf'); const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const width = pdf.internal.pageSize.getWidth(); const height = pdf.internal.pageSize.getHeight(); const margin = 15; let y = 20; let page = 1;
      const footer = () => { pdf.setFontSize(7); pdf.setTextColor(90,105,99); pdf.text('Atelier pédagogique · Plan d’action', margin, height - 8); pdf.text(`Page ${page}`, width - margin, height - 8, { align: 'right' }); };
      const nextPage = () => { footer(); pdf.addPage(); page += 1; y = 18; };
      const field = (label: string, value: string) => { const lines = pdf.splitTextToSize(value || '—', width - margin * 2) as string[]; if (y + lines.length * 4.5 + 10 > height - 15) nextPage(); pdf.setFont('helvetica','bold'); pdf.setFontSize(8); pdf.setTextColor(22,52,43); pdf.text(label, margin, y); y += 4.5; pdf.setFont('helvetica','normal'); pdf.text(lines, margin, y); y += lines.length * 4.5 + 3; };
      pdf.setFillColor(79,56,99); pdf.rect(0,0,width,48,'F'); pdf.setTextColor(229,206,247); pdf.setFont('helvetica','bold'); pdf.setFontSize(9); pdf.text('ATELIER POUR LES ÉLUS DU CSE', margin,15); pdf.setTextColor(255,255,255); pdf.setFontSize(22); pdf.text('Plans d’action de prévention', margin,31); y = 60;
      plans.forEach((plan, index) => {
        if (index) nextPage(); const risk = risks.find((item) => item.id === plan.riskId);
        pdf.setFont('helvetica','bold'); pdf.setFontSize(16); pdf.setTextColor(79,56,99); pdf.text(`${risk?.riskNo || 'Risque'} · ${risk?.family || ''}`, margin, y); y += 10;
        field('Danger et travail réel', `${risk?.danger || '—'} · ${risk?.activity || '—'}`); field('Action proposée', plan.action); field('Principes retenus', retainedFor(plan));
        field('Pilotage', `Responsable : ${plan.responsible} · priorité : ${plan.priority} · statut : ${plan.status}`); field('Calendrier', `Définie le ${formatDate(plan.definedOn)} · fin prévue ${formatDate(plan.dueOn)} · point d’étape ${formatDate(plan.reviewOn)}`);
        field('Moyens', plan.means); field('Personnes associées', plan.contributors); field('Première étape', plan.firstMilestone); field('Freins anticipés', plan.obstacles);
        field('Indicateur de réalisation', plan.implementationIndicator); field('Indicateur de réussite', plan.successIndicator);
      });
      footer(); pdf.save('atelier-plan-action-prevention.pdf'); setMessage('Le document PDF a été généré.');
    } finally { setIsGenerating(false); }
  };
  const retainedFor = (plan: ActionPlan) => principles.filter((principle) => plan.principles[principle.id]?.decision === 'retained').map((principle) => `P${principle.id} · ${principle.title}`).join(' ; ') || 'Aucun principe retenu';

  return <main className="action-page">
    <header className="site-header"><a className="brand" href="/" aria-label="Retour à l’accueil"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a><div className="duerp-header-actions"><button type="button" onClick={resetPlans}>Réinitialiser</button><a className="header-link" href="/">Tous les ateliers</a></div></header>
    <section className="action-hero"><div><p className="eyebrow">Atelier 06 · Plan d’action</p><h1>Transformer un risque en engagement.</h1><p>Reprenez une ligne du DUERP, examinez les neuf principes de prévention, puis organisez qui fait quoi, avec quels moyens et pour quelle date.</p></div><aside><span>Le fil conducteur</span><strong>Une action utile est précise, attribuée, datée, financée et vérifiable.</strong></aside></section>
    <nav className="action-steps" aria-label="Étapes du plan d’action">{[[1,'Choisir le risque'],[2,'Examiner les principes'],[3,'Organiser l’action'],[4,'Suivre les plans']].map(([number,label]) => <button type="button" key={number} className={step === number ? 'active' : step > Number(number) ? 'done' : ''} onClick={() => goTo(Number(number) as PlanStep)}><span>{number}</span><strong>{label}</strong></button>)}</nav>
    <section className="action-workspace">
      {message ? <div className="duerp-message" role="status"><span>{message}</span><button type="button" onClick={() => setMessage('')} aria-label="Fermer">×</button></div> : null}
      {step === 1 ? <div className="action-stage"><div className="action-stage-heading"><p className="eyebrow">Étape 1</p><h2>Quel risque voulez-vous traiter ?</h2><p>Les risques enregistrés dans l’atelier DUERP sur cet appareil apparaissent ici.</p></div>{risks.length ? <div className="action-risk-picker">{risks.map((risk) => <button type="button" key={risk.id} onClick={() => chooseRisk(risk)}><span className={`action-risk-score ${levelClass(risk.residual)}`}><strong>{formatNumber(risk.residual)}</strong><small>{levelFor(risk.residual)}</small></span><span><small>{risk.riskNo} · {risk.unit} · {risk.job}</small><strong>{risk.family}</strong><p>{risk.danger}</p></span><b>→</b></button>)}</div> : <div className="action-empty"><h3>Aucun risque disponible</h3><p>Commencez par enregistrer une ligne dans l’atelier DUERP.</p><a className="button primary" href="/ateliers/duerp">Ouvrir l’atelier DUERP</a></div>}</div> : null}
      {step === 2 && selectedRisk ? <div className="action-stage">{riskReminder(selectedRisk)}{(() => { const principle = principles[principleIndex]; const answer = draft.principles[principle.id]; return <article className="duerp-principle-card"><header><div><span>Principe {principle.id} sur 9</span><h2>{principle.title}</h2></div><strong>P{principle.id}</strong></header><div className="duerp-question-progress"><i style={{ width: `${((principleIndex + 1) / 9) * 100}%` }} /></div><p className="duerp-principle-question">{principle.question}</p><div className="duerp-decision-buttons"><button type="button" className={answer.decision === 'retained' ? 'selected' : ''} onClick={() => updatePrinciple(principle.id,{decision:'retained'})}><span>✓</span><strong>Retenir ce principe</strong><small>Il guidera l’action.</small></button><button type="button" className={answer.decision === 'not-retained' ? 'selected muted' : ''} onClick={() => updatePrinciple(principle.id,{decision:'not-retained'})}><span>○</span><strong>Examiné, non retenu</strong><small>Expliquez pourquoi.</small></button></div><label>Conclusion du groupe<textarea rows={5} value={answer.note} onChange={(event) => updatePrinciple(principle.id,{note:event.target.value})} /></label><footer><button className="text-button" type="button" onClick={() => principleIndex ? setPrincipleIndex((current) => current - 1) : goTo(1)}>{principleIndex ? '← Principe précédent' : '← Choisir un autre risque'}</button><button className="button primary" type="button" onClick={nextPrinciple}>{principleIndex === 8 ? 'Organiser l’action' : 'Principe suivant'} →</button></footer></article>; })()}</div> : null}
      {step === 3 && selectedRisk ? <div className="action-stage">{riskReminder(selectedRisk)}<article className="action-form"><header><p className="eyebrow">Étape 3 · Pilotage</p><h2>Rendre l’action réalisable et vérifiable</h2><p>{retainedPrinciples.length} principe{retainedPrinciples.length > 1 ? 's' : ''} retenu{retainedPrinciples.length > 1 ? 's' : ''} : {retainedPrinciples.map((principle) => `P${principle.id}`).join(' · ') || 'aucun'}</p></header><div className="action-form-grid">
        <label className="wide">Action à réaliser<textarea rows={5} value={draft.action} onChange={(event) => setDraft((current) => ({...current,action:event.target.value}))} placeholder="Commencez par un verbe : supprimer, remplacer, installer, réorganiser…" /></label>
        <label>Qui réalise ou pilote l’action ?<input value={draft.responsible} onChange={(event) => setDraft((current) => ({...current,responsible:event.target.value}))} placeholder="Nom ou fonction" /></label><label>Priorité<select value={draft.priority} onChange={(event) => setDraft((current) => ({...current,priority:event.target.value}))}><option value="">Choisir</option><option>Immédiate</option><option>Haute</option><option>Moyenne</option><option>À programmer</option></select></label>
        <label>Date de définition de l’action<input type="date" value={draft.definedOn} onChange={(event) => setDraft((current) => ({...current,definedOn:event.target.value}))} /></label><label>Date prévue de fin<input type="date" value={draft.dueOn} onChange={(event) => setDraft((current) => ({...current,dueOn:event.target.value}))} /></label>
        <label className="wide">Moyens donnés pour réaliser l’action<textarea rows={4} value={draft.means} onChange={(event) => setDraft((current) => ({...current,means:event.target.value}))} placeholder="Budget, temps, matériel, compétences, accompagnement…" /></label><label>Date du point d’étape<input type="date" value={draft.reviewOn} onChange={(event) => setDraft((current) => ({...current,reviewOn:event.target.value}))} /></label><label>Statut<select value={draft.status} onChange={(event) => setDraft((current) => ({...current,status:event.target.value}))}><option>À lancer</option><option>En préparation</option><option>En cours</option><option>Bloquée</option><option>Terminée</option><option>À vérifier</option></select></label>
        <label>Personnes à associer<input value={draft.contributors} onChange={(event) => setDraft((current) => ({...current,contributors:event.target.value}))} placeholder="Salariés, encadrement, service prévention…" /></label><label>Première étape concrète<input value={draft.firstMilestone} onChange={(event) => setDraft((current) => ({...current,firstMilestone:event.target.value}))} placeholder="Première décision ou réalisation attendue" /></label>
        <label>Freins ou dépendances<textarea rows={4} value={draft.obstacles} onChange={(event) => setDraft((current) => ({...current,obstacles:event.target.value}))} placeholder="Budget, achat, arbitrage, disponibilité…" /></label><label>Indicateur de réalisation<textarea rows={4} value={draft.implementationIndicator} onChange={(event) => setDraft((current) => ({...current,implementationIndicator:event.target.value}))} placeholder="Ce qui prouve que l’action a été faite" /></label>
        <label className="wide">Indicateur de réussite<input value={draft.successIndicator} onChange={(event) => setDraft((current) => ({...current,successIndicator:event.target.value}))} placeholder="Ce qui prouve que l’exposition ou le niveau de risque diminue" /></label>
      </div><footer><button className="text-button" type="button" onClick={() => { setPrincipleIndex(8); goTo(2); }}>← Revoir les principes</button><button className="button primary" type="button" onClick={savePlan}>Enregistrer le plan →</button></footer></article></div> : null}
      {step === 4 ? <div className="action-stage"><div className="action-stage-heading"><p className="eyebrow">Étape 4</p><h2>Tableau de suivi des actions</h2><p>Chaque colonne aide le groupe à vérifier que l’action est pilotée jusqu’au résultat.</p></div>{planTable()}<div className="duerp-report-panel"><div><p className="eyebrow">Support pédagogique</p><h3>Emporter le tableau de suivi</h3><p>Le PDF reprend le risque, l’action, son responsable, son calendrier, ses moyens et ses indicateurs.</p></div><div><button className="text-button light" type="button" onClick={() => goTo(1)}>+ Créer un autre plan</button><button className="button primary" type="button" disabled={isGenerating} onClick={downloadPdf}>{isGenerating ? 'Création…' : 'Télécharger le PDF'}</button></div></div></div> : null}
    </section>
  </main>;
}
