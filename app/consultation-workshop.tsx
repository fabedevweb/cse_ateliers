'use client';

import { FormEvent, useMemo, useState } from 'react';

type Opinion = 'favorable' | 'defavorable' | '';
type FormState = { company: string; meetingDate: string; electedMembers: string; opinion: Opinion; information: string; findings: string; measures: string; reservations: string; followUp: string };

export type ConsultationScenario = {
  workshopNumber: string;
  association: string;
  workforce: string;
  activity: string;
  subject: string;
  heroTitle: string;
  heroIntro: string;
  caseTitle: string;
  situation: string[];
  facts: [string, string][];
  requestTable?: { title: string; headers: string[]; rows: string[][] };
  proposal?: { title: string; paragraphs?: string[]; criteria?: string[]; decisions?: string[] };
  analysisTitle: string;
  analysisCards: { title: string; level: string; text: string }[];
  debate: string;
  legalExplanation: string;
  legalArticleLabel: string;
  legalArticleUrl: string;
  legalBasis: string;
  formPrompts: {
    informationLabel: string;
    informationPlaceholder: string;
    findingsLabel: string;
    findingsPlaceholder: string;
    measuresLabel: string;
    measuresPlaceholder: string;
  };
  fileSlug: string;
};

export default function ConsultationWorkshop({ scenario }: { scenario: ConsultationScenario }) {
  const [form, setForm] = useState<FormState>({ company: scenario.association, meetingDate: '', electedMembers: '', opinion: '', information: '', findings: '', measures: '', reservations: '', followUp: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const completed = useMemo(() => {
    const checks = [form.meetingDate, form.electedMembers, form.opinion, form.information, form.findings, form.measures];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
  };

  const downloadOpinion = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!form.opinion) return;

    setIsGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const document = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = document.internal.pageSize.getWidth();
      const pageHeight = document.internal.pageSize.getHeight();
      const margin = 18;
      const textWidth = pageWidth - margin * 2;
      const bottomLimit = pageHeight - 20;
      const opinionLabel = form.opinion === 'favorable' ? 'FAVORABLE' : 'DÉFAVORABLE';
      const accent: [number, number, number] = form.opinion === 'favorable' ? [22, 123, 91] : [180, 60, 50];
      const dateLabel = form.meetingDate ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${form.meetingDate}T12:00:00`)) : 'Non renseignée';
      let y = 20;

      const ensureSpace = (height: number) => {
        if (y + height <= bottomLimit) return;
        document.addPage();
        y = 20;
      };

      const addSection = (title: string, content: string) => {
        const value = content.trim() || 'Non renseigné';
        document.setFont('helvetica', 'normal');
        document.setFontSize(10.5);
        const lines = document.splitTextToSize(value, textWidth) as string[];
        const sectionHeight = 13 + lines.length * 5.2;
        ensureSpace(sectionHeight);
        document.setTextColor(22, 52, 43);
        document.setFont('helvetica', 'bold');
        document.setFontSize(12.5);
        document.text(title, margin, y);
        y += 7;
        document.setTextColor(64, 83, 76);
        document.setFont('helvetica', 'normal');
        document.setFontSize(10.5);
        document.text(lines, margin, y);
        y += lines.length * 5.2 + 7;
      };

      document.setFillColor(15, 82, 61);
      document.rect(0, 0, pageWidth, 48, 'F');
      document.setTextColor(223, 241, 106);
      document.setFont('helvetica', 'bold');
      document.setFontSize(9);
      document.text('EXERCICE PÉDAGOGIQUE · CSE DE MOINS DE 50 SALARIÉS', margin, 15);
      document.setTextColor(255, 255, 255);
      document.setFontSize(22);
      document.text('Avis du comité social et économique', margin, 27);
      document.setFont('helvetica', 'normal');
      document.setFontSize(10.5);
      document.text(document.splitTextToSize(scenario.subject, textWidth), margin, 36);
      y = 58;

      document.setFillColor(242, 245, 243);
      document.roundedRect(margin, y, textWidth, 39, 2, 2, 'F');
      document.setTextColor(22, 52, 43);
      document.setFontSize(10);
      document.setFont('helvetica', 'bold');
      document.text('Association :', margin + 5, y + 8);
      document.text('Date de la réunion :', margin + 5, y + 17);
      document.text('Élus ayant participé :', margin + 5, y + 26);
      document.setFont('helvetica', 'normal');
      document.text(form.company || 'Non renseignée', margin + 34, y + 8);
      document.text(dateLabel, margin + 45, y + 17);
      document.text(document.splitTextToSize(form.electedMembers || 'Non renseigné', textWidth - 49).slice(0, 2), margin + 49, y + 26);
      y += 50;

      document.setDrawColor(...accent);
      document.setTextColor(...accent);
      document.setLineWidth(0.7);
      document.roundedRect(margin, y, 58, 14, 2, 2, 'S');
      document.setFont('helvetica', 'bold');
      document.setFontSize(12);
      document.text(`AVIS ${opinionLabel}`, margin + 5, y + 9);
      y += 25;

      addSection('Qualité des informations reçues', form.information);
      addSection('Constats et analyse', form.findings);
      addSection('Demandes et préconisations du CSE', form.measures);
      addSection('Réserves éventuelles', form.reservations);
      addSection('Modalités de suivi', form.followUp);

      const footerLines = document.splitTextToSize(`Document produit dans le cadre d’un cas fictif de formation. Il ne constitue pas un conseil juridique. Base pédagogique : ${scenario.legalBasis}.`, textWidth) as string[];
      ensureSpace(footerLines.length * 4.2 + 10);
      document.setDrawColor(204, 211, 207);
      document.line(margin, y, pageWidth - margin, y);
      y += 6;
      document.setTextColor(104, 115, 110);
      document.setFont('helvetica', 'normal');
      document.setFontSize(8);
      document.text(footerLines, margin, y);

      document.save(`avis-cse-${scenario.fileSlug}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
        <a className="header-link" href="/ateliers/avis-duerp">Les deux scénarios</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Avis après consultation · Scénario {scenario.workshopNumber}</p>
          <h1>{scenario.heroTitle}</h1>
          <p className="hero-intro">{scenario.heroIntro}</p>
          <a className="button primary" href="#cas-pratique">Commencer l’exercice <span aria-hidden="true">→</span></a>
        </div>
        <aside className="hero-card" aria-label="Aperçu de l’atelier">
          <div className="card-topline"><span>Cas fictif</span><span className="status-dot">Disponible</span></div>
          <p className="hero-card-number">Scénario {scenario.workshopNumber}</p><h2>{scenario.association}</h2><p>{scenario.workforce} · 35 à 45 min · Travail en groupe</p>
          <div className="mini-steps" aria-hidden="true"><span className="active">1</span><i></i><span>2</span><i></i><span>3</span></div>
        </aside>
      </section>

      <section className="section scenario" id="cas-pratique">
        <div className="section-heading"><div><p className="eyebrow">Le contexte</p><h2>{scenario.caseTitle}</h2></div><p className="section-note">La situation, l’association et les données de cet exercice sont fictives.</p></div>
        <div className="scenario-grid">
          <article className="case-sheet"><p className="case-label">Note remise aux élus</p><h3>Vous êtes membres du CSE de {scenario.association}.</h3>
            {scenario.situation.map((paragraphText) => <p key={paragraphText}>{paragraphText}</p>)}
            <div className="fact-grid">{scenario.facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          </article>
          <aside className="legal-card"><p className="eyebrow">Code du travail</p><h3>Le repère donné aux participants</h3>
            <p>{scenario.legalExplanation}</p>
            <div className="legal-links"><a href={scenario.legalArticleUrl} target="_blank" rel="noreferrer">{scenario.legalArticleLabel} ↗</a></div>
            <p className="disclaimer">Support de formation à adapter au contexte réel. Il ne remplace pas un conseil juridique.</p>
          </aside>
        </div>

        {scenario.requestTable && <div className="scenario-table-block">
          <h3>{scenario.requestTable.title}</h3>
          <div className="scenario-table-wrap"><table className="scenario-table"><thead><tr>{scenario.requestTable.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{scenario.requestTable.rows.map((row) => <tr key={row.join('-')}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>
        </div>}

        {scenario.proposal && <article className="proposal-box">
          <p className="case-label">Proposition de l’employeur</p><h3>{scenario.proposal.title}</h3>
          {scenario.proposal.paragraphs?.map((text) => <p key={text}>{text}</p>)}
          {scenario.proposal.criteria && <ol>{scenario.proposal.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ol>}
          {scenario.proposal.decisions && <ul>{scenario.proposal.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul>}
        </article>}
      </section>

      <section className="section risks">
        <div className="section-heading compact"><div><p className="eyebrow">Points à analyser</p><h2>{scenario.analysisTitle}</h2></div></div>
        <div className="risk-grid">{scenario.analysisCards.map((item, index) => <article className="risk-card" key={item.title}><div className="risk-index">0{index + 1}</div><div><span className="risk-level">{item.level}</span><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
        <div className="prompt-box"><strong>Question à débattre</strong><p>{scenario.debate}</p></div>
      </section>

      <section className="section workshop" id="atelier">
        <div className="workshop-header"><div><p className="eyebrow">Votre production</p><h2>Rédiger l’avis du CSE</h2></div><div className="progress" aria-label={`Formulaire complété à ${completed} %`}><span>{completed}% complété</span><div><i style={{ width: `${completed}%` }} /></div></div></div>
        <form onSubmit={downloadOpinion}>
          <fieldset className="form-section"><legend><span>1</span> Identifier la délibération</legend><div className="form-grid"><label>Association<input value={form.company} onChange={(e) => update('company', e.target.value)} required /></label><label>Date de la réunion<input type="date" value={form.meetingDate} onChange={(e) => update('meetingDate', e.target.value)} required /></label></div><label>Élus ayant participé<textarea rows={2} value={form.electedMembers} onChange={(e) => update('electedMembers', e.target.value)} placeholder="Ex. : Marie Martin, titulaire ; Louis Robert, suppléant…" required /></label></fieldset>
          <fieldset className="form-section"><legend><span>2</span> Choisir le sens de l’avis</legend><div className="opinion-grid">
            <label className={`opinion-card positive ${form.opinion === 'favorable' ? 'selected' : ''}`}><input type="radio" name="opinion" value="favorable" checked={form.opinion === 'favorable'} onChange={() => update('opinion', 'favorable')} /><span className="opinion-icon" aria-hidden="true">+</span><strong>Avis favorable</strong><small>Le CSE approuve la proposition, avec ou sans réserves.</small></label>
            <label className={`opinion-card negative ${form.opinion === 'defavorable' ? 'selected' : ''}`}><input type="radio" name="opinion" value="defavorable" checked={form.opinion === 'defavorable'} onChange={() => update('opinion', 'defavorable')} /><span className="opinion-icon" aria-hidden="true">−</span><strong>Avis défavorable</strong><small>Le CSE n’approuve pas la proposition en l’état.</small></label>
          </div>{submitted && !form.opinion && <p className="error" role="alert">Choisissez un avis favorable ou défavorable.</p>}</fieldset>
          <fieldset className="form-section"><legend><span>3</span> Motiver et rendre l’avis</legend>
            <label>{scenario.formPrompts.informationLabel}<textarea rows={3} value={form.information} onChange={(e) => update('information', e.target.value)} placeholder={scenario.formPrompts.informationPlaceholder} required /></label>
            <label>{scenario.formPrompts.findingsLabel}<textarea rows={4} value={form.findings} onChange={(e) => update('findings', e.target.value)} placeholder={scenario.formPrompts.findingsPlaceholder} required /></label>
            <label>{scenario.formPrompts.measuresLabel}<textarea rows={4} value={form.measures} onChange={(e) => update('measures', e.target.value)} placeholder={scenario.formPrompts.measuresPlaceholder} required /></label>
            <div className="form-grid"><label>Réserves éventuelles<textarea rows={3} value={form.reservations} onChange={(e) => update('reservations', e.target.value)} placeholder="Facultatif" /></label><label>Suivi proposé<textarea rows={3} value={form.followUp} onChange={(e) => update('followUp', e.target.value)} placeholder="Ex. : point de suivi lors de la prochaine réunion" /></label></div>
          </fieldset>
          <div className="download-panel"><div><p className="eyebrow">Dernière étape</p><h3>Télécharger l’avis au format PDF</h3><p>Un document PDF prêt à imprimer est créé directement à partir de vos réponses.</p></div><button className="button primary" type="submit" disabled={isGenerating}>{isGenerating ? 'Création du PDF…' : 'Télécharger mon avis en PDF'} <span aria-hidden="true">↓</span></button></div>
        </form>
      </section>

      <footer className="footer"><div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div><p>Un outil pédagogique simple pour apprendre en faisant.</p><a href="#top">Retour en haut ↑</a></footer>
    </main>
  );
}
