'use client';

import { useEffect, useMemo, useState } from 'react';

type RiskLevel = 'Faible' | 'À surveiller' | 'Prioritaire' | 'Urgent';
type InspectionData = {
  association: string;
  workforce: string;
  site: string;
  inspectionDate: string;
  startTime: string;
  endTime: string;
  objective: string;
  team: string;
  roles: string;
  activities: string;
  employees: string;
  documents: string[];
  equipment: string[];
  themes: string[];
  preparationNotes: string;
  duerpFollowUp: string;
  reportRecipients: string;
  nextReviewDate: string;
  reportValidated: boolean;
  resultsShared: boolean;
};

type Observation = {
  id: string;
  zone: string;
  category: string;
  facts: string;
  employeeFeedback: string;
  existingMeasures: string;
  riskLevel: RiskLevel;
  proposedAction: string;
  owner: string;
  deadline: string;
};

const STORAGE_KEY = 'cse-inspection-2027-v1';
const documentOptions = ['DUERP et plan d’actions', 'Registre santé et sécurité', 'Accidents, incidents et signalements', 'Fiches de données de sécurité', 'Consignes et procédures', 'Carnets de maintenance', 'Liste des formations et habilitations'];
const equipmentOptions = ['Grille d’observation', 'Trame d’entretien', 'Équipements de protection', 'Appareil photo ou téléphone', 'Appareil de mesure adapté', 'Plan des locaux'];
const themeOptions = ['Environnement de travail', 'Gestes, postures et déplacements', 'Produits et substances', 'Machines et équipements', 'Organisation et charge de travail', 'Relations et climat social', 'Travail isolé et coactivité', 'Circulation, incendie et secours'];
const categories = ['Environnement', 'Ergonomie', 'Produits', 'Équipements', 'Organisation', 'Relations de travail', 'Coactivité', 'Circulation / secours', 'Autre'];

const initialData: InspectionData = {
  association: '', workforce: '', site: '', inspectionDate: '', startTime: '', endTime: '', objective: '', team: '', roles: '', activities: '', employees: '',
  documents: [], equipment: [], themes: [], preparationNotes: '', duerpFollowUp: '', reportRecipients: '', nextReviewDate: '', reportValidated: false, resultsShared: false,
};

const makeObservation = (): Observation => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  zone: '', category: 'Environnement', facts: '', employeeFeedback: '', existingMeasures: '', riskLevel: 'À surveiller', proposedAction: '', owner: '', deadline: '',
});

const formatDate = (value: string) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`)) : 'Non renseignée';

export default function InspectionWorkshop() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<InspectionData>(initialData);
  const [observations, setObservations] = useState<Observation[]>([makeObservation()]);
  const [hydrated, setHydrated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedLabel, setSavedLabel] = useState('Sauvegarde locale active');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { data?: InspectionData; observations?: Observation[] };
        if (parsed.data) setData({ ...initialData, ...parsed.data });
        if (parsed.observations?.length) setObservations(parsed.observations);
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, observations }));
        setSavedLabel('Enregistré sur cet appareil');
      } catch {
        setSavedLabel('Sauvegarde indisponible');
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [data, observations, hydrated]);

  const completedPreparation = useMemo(() => [data.association, data.site, data.inspectionDate, data.objective, data.team, data.activities].filter(Boolean).length, [data]);
  const validObservations = useMemo(() => observations.filter((item) => item.zone.trim() || item.facts.trim() || item.proposedAction.trim()), [observations]);
  const priorityCount = useMemo(() => validObservations.filter((item) => item.riskLevel === 'Prioritaire' || item.riskLevel === 'Urgent').length, [validObservations]);

  const updateData = <K extends keyof InspectionData>(field: K, value: InspectionData[K]) => setData((current) => ({ ...current, [field]: value }));
  const toggleChoice = (field: 'documents' | 'equipment' | 'themes', value: string) => {
    setData((current) => ({ ...current, [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value] }));
  };
  const updateObservation = (id: string, field: keyof Observation, value: string) => setObservations((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  const addObservation = () => setObservations((current) => [...current, makeObservation()]);
  const removeObservation = (id: string) => setObservations((current) => current.length === 1 ? current : current.filter((item) => item.id !== id));

  const downloadReport = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 17;
      const contentWidth = pageWidth - margin * 2;
      const bottom = pageHeight - 18;
      let y = 20;
      let pageNumber = 1;

      const footer = () => {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(103, 116, 109);
        pdf.text(`Rapport d’inspection CSE · ${data.association || 'Association non renseignée'}`, margin, pageHeight - 10);
        pdf.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      };
      const nextPage = () => { footer(); pdf.addPage(); pageNumber += 1; y = 18; };
      const ensure = (height: number) => { if (y + height > bottom) nextPage(); };
      const lines = (text: string, width = contentWidth) => pdf.splitTextToSize(text.trim() || 'Non renseigné', width) as string[];
      const sectionTitle = (title: string) => {
        ensure(15); y += 3; pdf.setFillColor(223, 241, 106); pdf.roundedRect(margin, y - 5, 7, 7, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(14); pdf.setTextColor(22, 52, 43); pdf.text(title, margin + 11, y); y += 9;
      };
      const paragraph = (label: string, value: string) => {
        const body = lines(value); const height = 8 + body.length * 4.7; ensure(height);
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.5); pdf.setTextColor(22, 52, 43); pdf.text(label, margin, y);
        y += 5; pdf.setFont('helvetica', 'normal'); pdf.setTextColor(64, 83, 76); pdf.text(body, margin, y); y += body.length * 4.7 + 4;
      };
      const bulletList = (items: string[]) => {
        if (!items.length) { paragraph('', 'Aucun élément sélectionné.'); return; }
        items.forEach((item) => { const body = lines(item, contentWidth - 7); ensure(body.length * 4.7 + 3); pdf.setFillColor(23, 111, 82); pdf.circle(margin + 1.5, y - 1.2, 1.1, 'F'); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); pdf.setTextColor(64, 83, 76); pdf.text(body, margin + 6, y); y += body.length * 4.7 + 2; });
        y += 3;
      };

      pdf.setFillColor(15, 82, 61); pdf.rect(0, 0, pageWidth, 52, 'F');
      pdf.setTextColor(223, 241, 106); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); pdf.text('COMITÉ SOCIAL ET ÉCONOMIQUE · MOINS DE 50 SALARIÉS', margin, 14);
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(23); pdf.text('Rapport d’inspection', margin, 28);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10.5); pdf.text(lines(`Santé, sécurité et conditions de travail · Inspection réalisée le ${formatDate(data.inspectionDate)}`, contentWidth), margin, 39);
      y = 62;

      sectionTitle('1. Identification et organisation');
      paragraph('Association / entreprise', data.association);
      paragraph('Effectif', data.workforce || 'Moins de 50 salariés');
      paragraph('Lieu ou périmètre inspecté', data.site);
      paragraph('Horaires de l’inspection', `${data.startTime || '—'} à ${data.endTime || '—'}`);
      paragraph('Équipe d’inspection', data.team);
      paragraph('Répartition des rôles', data.roles);
      paragraph('Objectif retenu', data.objective);
      paragraph('Activités observées et moment choisi', data.activities);
      paragraph('Salariés ou interlocuteurs rencontrés', data.employees);

      sectionTitle('2. Préparation');
      paragraph('Thèmes retenus', data.themes.join(' · '));
      paragraph('Documents examinés', data.documents.join(' · '));
      paragraph('Outils et matériel mobilisés', data.equipment.join(' · '));
      paragraph('Notes préparatoires', data.preparationNotes);

      sectionTitle('3. Observations de terrain');
      if (!validObservations.length) paragraph('', 'Aucune observation renseignée.');
      validObservations.forEach((item, index) => {
        const observationHeight = 24 + lines(item.facts).length * 4.7 + lines(item.employeeFeedback).length * 4.7 + lines(item.existingMeasures).length * 4.7;
        ensure(Math.min(observationHeight, 70));
        pdf.setFillColor(242, 245, 243); pdf.roundedRect(margin, y - 4, contentWidth, 13, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(22, 52, 43); pdf.text(`Observation ${index + 1} · ${item.zone || 'Zone non renseignée'}`, margin + 5, y + 3);
        pdf.setFontSize(8.5); pdf.setTextColor(item.riskLevel === 'Urgent' ? 180 : 23, item.riskLevel === 'Urgent' ? 60 : 111, item.riskLevel === 'Urgent' ? 50 : 82); pdf.text(`${item.category} · ${item.riskLevel}`, pageWidth - margin - 5, y + 3, { align: 'right' });
        y += 15; paragraph('Faits observés', item.facts); paragraph('Parole des salariés', item.employeeFeedback); paragraph('Mesures déjà en place', item.existingMeasures);
      });

      sectionTitle('4. Plan d’actions proposé');
      const actions = validObservations.filter((item) => item.proposedAction.trim());
      if (!actions.length) paragraph('', 'Aucune action proposée.');
      actions.forEach((item, index) => {
        ensure(33); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10.5); pdf.setTextColor(22, 52, 43); pdf.text(`${index + 1}. ${item.proposedAction}`, margin, y, { maxWidth: contentWidth });
        y += lines(item.proposedAction).length * 4.7 + 2; pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(96, 115, 108);
        pdf.text(`Zone : ${item.zone || '—'} · Priorité : ${item.riskLevel} · Responsable proposé : ${item.owner || '—'} · Échéance : ${formatDate(item.deadline)}`, margin, y, { maxWidth: contentWidth }); y += 10;
      });

      sectionTitle('5. Suites de l’inspection');
      paragraph('Lien avec le DUERP et la prévention', data.duerpFollowUp);
      paragraph('Destinataires du rapport', data.reportRecipients);
      paragraph('Prochaine date de suivi', formatDate(data.nextReviewDate));
      bulletList([data.reportValidated ? 'Compte rendu relu et validé avec les participants.' : 'Compte rendu à valider avec les participants.', data.resultsShared ? 'Résultats partagés avec les salariés et l’encadrement.' : 'Partage des résultats à organiser.']);

      sectionTitle('6. Repères méthodologiques');
      bulletList(['Observer les situations réelles de travail.', 'Interroger les salariés avec des questions simples, ouvertes et bienveillantes.', 'Analyser les dimensions collectives plutôt que les situations individuelles.', 'Discuter les résultats en séance et suivre les mesures de prévention.']);
      paragraph('Source pédagogique', 'INRS, ED 6513 « Réaliser une inspection », avril 2023. Repère juridique : article L. 2312-5 du Code du travail. Support de formation à adapter à la situation réelle.');
      footer();
      pdf.save(`rapport-inspection-cse-${data.inspectionDate || '2027'}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="inspection-page" id="top">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
        <a className="header-link" href="/">Tous les ateliers</a>
      </header>

      <section className="inspection-hero">
        <div className="inspection-hero-copy"><p className="eyebrow">Atelier 04 · Santé, sécurité et conditions de travail</p><h1>Préparer une inspection utile.</h1><p>Un parcours guidé pour organiser votre inspection 2027, observer le travail réel et présenter des propositions concrètes à la direction.</p></div>
        <div className="inspection-hero-note"><span>Votre cadre</span><strong>CSE de 11 à 49 salariés</strong><p>Aucun nombre minimal d’inspections n’est fixé pour ce seuil. Construisez un programme adapté aux activités et aux risques de votre structure.</p><a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893930" target="_blank" rel="noreferrer">Article L. 2312-5 ↗</a></div>
      </section>

      <nav className="inspection-steps" aria-label="Étapes de l’atelier">
        {[
          [1, 'Avant', 'Préparer'], [2, 'Pendant', 'Inspecter'], [3, 'Après', 'Rapport'],
        ].map(([number, label, title]) => <button key={number} className={step === number ? 'active' : step > Number(number) ? 'done' : ''} onClick={() => setStep(Number(number))}><span>{number}</span><small>{label}</small><strong>{title}</strong></button>)}
        <p>{savedLabel}</p>
      </nav>

      <section className="inspection-workspace">
        {step === 1 && <div className="inspection-stage">
          <div className="inspection-stage-heading"><div><p className="eyebrow">Étape 1 · Avant</p><h2>Formaliser, s’informer, planifier</h2></div><span>{completedPreparation}/6 informations essentielles</span></div>

          <div className="inspection-panel"><h3>Cadre de l’inspection</h3><div className="inspection-form-grid three"><label>Association ou entreprise<input value={data.association} onChange={(event) => updateData('association', event.target.value)} placeholder="Nom de la structure" /></label><label>Effectif<input value={data.workforce} onChange={(event) => updateData('workforce', event.target.value)} placeholder="Ex. : 32 salariés" /></label><label>Lieu ou périmètre<input value={data.site} onChange={(event) => updateData('site', event.target.value)} placeholder="Service, atelier, site…" /></label></div><div className="inspection-form-grid three"><label>Date prévue en 2027<input type="date" min="2027-01-01" max="2027-12-31" value={data.inspectionDate} onChange={(event) => updateData('inspectionDate', event.target.value)} /></label><label>Heure de début<input type="time" value={data.startTime} onChange={(event) => updateData('startTime', event.target.value)} /></label><label>Heure de fin<input type="time" value={data.endTime} onChange={(event) => updateData('endTime', event.target.value)} /></label></div><label>Objectif précis de l’inspection<textarea rows={3} value={data.objective} onChange={(event) => updateData('objective', event.target.value)} placeholder="Ex. : observer les conditions de travail lors de la fermeture du site et vérifier les mesures prévues au DUERP…" /></label></div>

          <div className="inspection-panel"><h3>Équipe et moment choisi</h3><div className="inspection-form-grid"><label>Composition de l’équipe<textarea rows={3} value={data.team} onChange={(event) => updateData('team', event.target.value)} placeholder="Élus, accompagnants, personnes qualifiées…" /></label><label>Rôle de chacun<textarea rows={3} value={data.roles} onChange={(event) => updateData('roles', event.target.value)} placeholder="Observation, entretiens, prise de notes, photos…" /></label></div><label>Activités à observer et raison du créneau choisi<textarea rows={3} value={data.activities} onChange={(event) => updateData('activities', event.target.value)} placeholder="Jour, horaire atypique, pic d’activité, coactivité ou situation particulière…" /></label><label>Salariés ou interlocuteurs à rencontrer<textarea rows={2} value={data.employees} onChange={(event) => updateData('employees', event.target.value)} placeholder="Métiers, équipes, encadrement, prestataires…" /></label></div>

          <Checklist title="Documents à consulter" subtitle="Rassemblez les informations utiles avant de vous déplacer." options={documentOptions} selected={data.documents} onToggle={(value) => toggleChoice('documents', value)} />
          <Checklist title="Matériel à prévoir" subtitle="Choisissez uniquement ce qui est adapté au terrain." options={equipmentOptions} selected={data.equipment} onToggle={(value) => toggleChoice('equipment', value)} />
          <Checklist title="Thèmes d’observation" subtitle="Définissez un périmètre réaliste pour garder une inspection ciblée." options={themeOptions} selected={data.themes} onToggle={(value) => toggleChoice('themes', value)} />

          <div className="inspection-panel"><label>Notes préparatoires<textarea rows={4} value={data.preparationNotes} onChange={(event) => updateData('preparationNotes', event.target.value)} placeholder="Points de vigilance, questions à poser, informations à vérifier…" /></label></div>
          <div className="inspection-stage-actions"><a href="https://www.inrs.fr/media.html?refINRS=ED+6513" target="_blank" rel="noreferrer">Consulter la fiche INRS ED 6513 ↗</a><button className="button primary" onClick={() => setStep(2)}>Passer à l’inspection →</button></div>
        </div>}

        {step === 2 && <div className="inspection-stage">
          <div className="inspection-stage-heading"><div><p className="eyebrow">Étape 2 · Pendant</p><h2>Observer, échanger et contrôler</h2></div><span>{validObservations.length} observation{validObservations.length > 1 ? 's' : ''} renseignée{validObservations.length > 1 ? 's' : ''}</span></div>
          <aside className="field-reminder"><strong>Sur le terrain</strong><p>Décrivez des faits observables, demandez au salarié comment le travail se réalise réellement et distinguez ce qui existe déjà de ce qui reste à améliorer.</p><div><span>Questions ouvertes</span><span>Regard collectif</span><span>Écoute bienveillante</span><span>Photos avec accord</span></div></aside>

          <div className="observation-list">{observations.map((item, index) => <article className="observation-card" key={item.id}>
            <div className="observation-card-head"><div><span>Observation {String(index + 1).padStart(2, '0')}</span><h3>{item.zone || 'Nouvelle observation'}</h3></div><button onClick={() => removeObservation(item.id)} disabled={observations.length === 1}>Supprimer</button></div>
            <div className="inspection-form-grid three"><label>Zone, poste ou situation<input value={item.zone} onChange={(event) => updateObservation(item.id, 'zone', event.target.value)} placeholder="Ex. : accueil, réserve, fermeture…" /></label><label>Thème<select value={item.category} onChange={(event) => updateObservation(item.id, 'category', event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Niveau de priorité<select value={item.riskLevel} onChange={(event) => updateObservation(item.id, 'riskLevel', event.target.value)}>{(['Faible', 'À surveiller', 'Prioritaire', 'Urgent'] as RiskLevel[]).map((level) => <option key={level}>{level}</option>)}</select></label></div>
            <label>Faits observés<textarea rows={3} value={item.facts} onChange={(event) => updateObservation(item.id, 'facts', event.target.value)} placeholder="Décrivez précisément l’environnement, l’activité, les gestes, déplacements, produits ou équipements…" /></label>
            <div className="inspection-form-grid"><label>Ce que disent les salariés<textarea rows={3} value={item.employeeFeedback} onChange={(event) => updateObservation(item.id, 'employeeFeedback', event.target.value)} placeholder="Ressenti, contraintes, charge mentale, difficultés et ressources…" /></label><label>Mesures déjà en place<textarea rows={3} value={item.existingMeasures} onChange={(event) => updateObservation(item.id, 'existingMeasures', event.target.value)} placeholder="Protection, consigne, formation, maintenance, organisation…" /></label></div>
            <label>Action de prévention proposée<textarea rows={2} value={item.proposedAction} onChange={(event) => updateObservation(item.id, 'proposedAction', event.target.value)} placeholder="Une mesure concrète, réaliste et vérifiable…" /></label>
            <div className="inspection-form-grid"><label>Responsable proposé<input value={item.owner} onChange={(event) => updateObservation(item.id, 'owner', event.target.value)} placeholder="Direction, responsable, prestataire…" /></label><label>Échéance proposée<input type="date" value={item.deadline} onChange={(event) => updateObservation(item.id, 'deadline', event.target.value)} /></label></div>
          </article>)}</div>
          <button className="add-observation" onClick={addObservation}><span>+</span> Ajouter une observation</button>
          <div className="inspection-stage-actions"><button className="text-button" onClick={() => setStep(1)}>← Revenir à la préparation</button><button className="button primary" onClick={() => setStep(3)}>Analyser et produire le rapport →</button></div>
        </div>}

        {step === 3 && <div className="inspection-stage">
          <div className="inspection-stage-heading"><div><p className="eyebrow">Étape 3 · Après</p><h2>Analyser, discuter, proposer</h2></div><span>{priorityCount} point{priorityCount > 1 ? 's' : ''} prioritaire{priorityCount > 1 ? 's' : ''}</span></div>
          <div className="report-summary"><div><span>Inspection</span><strong>{formatDate(data.inspectionDate)}</strong><small>{data.site || 'Lieu à préciser'}</small></div><div><span>Observations</span><strong>{validObservations.length}</strong><small>situations consignées</small></div><div><span>Actions</span><strong>{validObservations.filter((item) => item.proposedAction.trim()).length}</strong><small>mesures proposées</small></div><div><span>Priorités</span><strong>{priorityCount}</strong><small>prioritaires ou urgentes</small></div></div>

          <div className="inspection-panel"><h3>Préparer la présentation à la direction</h3><label>Comment relier les constats au DUERP et à la politique de prévention ?<textarea rows={4} value={data.duerpFollowUp} onChange={(event) => updateData('duerpFollowUp', event.target.value)} placeholder="Mise à jour d’un risque, ajout d’une mesure, révision d’une priorité, suivi d’un plan d’action…" /></label><div className="inspection-form-grid"><label>Destinataires du rapport<input value={data.reportRecipients} onChange={(event) => updateData('reportRecipients', event.target.value)} placeholder="Direction, encadrement, salariés…" /></label><label>Date du prochain suivi<input type="date" value={data.nextReviewDate} onChange={(event) => updateData('nextReviewDate', event.target.value)} /></label></div><div className="validation-checks"><label><input type="checkbox" checked={data.reportValidated} onChange={(event) => updateData('reportValidated', event.target.checked)} /><span>Le compte rendu a été relu et validé avec les participants.</span></label><label><input type="checkbox" checked={data.resultsShared} onChange={(event) => updateData('resultsShared', event.target.checked)} /><span>Le partage des résultats avec les salariés et l’encadrement est organisé.</span></label></div></div>

          <div className="report-action-panel"><div><p className="eyebrow">Document final</p><h3>Rapport d’inspection prêt à présenter</h3><p>Le PDF reprend la préparation, les faits observés, la parole des salariés, les priorités et le plan d’actions proposé.</p></div><button className="button primary" onClick={downloadReport} disabled={isGenerating}>{isGenerating ? 'Création du rapport…' : 'Télécharger le rapport PDF'} <span aria-hidden="true">↓</span></button></div>
          <div className="inspection-stage-actions"><button className="text-button" onClick={() => setStep(2)}>← Compléter les observations</button><a href="https://www.inrs.fr/media.html?refINRS=ED+6513" target="_blank" rel="noreferrer">Source pédagogique : INRS ED 6513 ↗</a></div>
        </div>}
      </section>

      <footer className="footer"><div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div><p>Vos données restent enregistrées sur cet appareil.</p><a href="#top">Retour en haut ↑</a></footer>
    </main>
  );
}

function Checklist({ title, subtitle, options, selected, onToggle }: { title: string; subtitle: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <div className="inspection-panel checklist-panel"><div className="checklist-heading"><div><h3>{title}</h3><p>{subtitle}</p></div><span>{selected.length}/{options.length}</span></div><div className="checklist-grid">{options.map((option) => <label className={selected.includes(option) ? 'selected' : ''} key={option}><input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} /><span>{option}</span></label>)}</div></div>;
}
