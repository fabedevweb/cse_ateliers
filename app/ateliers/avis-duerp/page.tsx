'use client';

import { FormEvent, useMemo, useState } from 'react';

type Opinion = 'favorable' | 'defavorable' | '';
type FormState = { company: string; meetingDate: string; electedMembers: string; opinion: Opinion; information: string; findings: string; measures: string; reservations: string; followUp: string };

const initialForm: FormState = { company: 'Élan Services', meetingDate: '', electedMembers: '', opinion: '', information: '', findings: '', measures: '', reservations: '', followUp: '' };
const scenarioFacts = [['Effectif', '34 salariés'], ['Activité', 'Préparation et expédition de commandes'], ['Objet', 'Mise à jour annuelle du DUERP'], ['Réunion', 'CSE ordinaire du 18 septembre 2026']];
const riskCards = [
  { title: 'Manutention', level: 'Élevé', text: 'Les colis de 8 à 22 kg sont encore portés manuellement sur 14 postes.' },
  { title: 'Bruit', level: 'Modéré', text: 'Le niveau relevé près de la filmeuse atteint 82 dB(A) sur certaines séquences.' },
  { title: 'Charge de travail', level: 'À préciser', text: 'Le pic saisonnier est mentionné, sans indicateur d’absentéisme ni mesure de charge.' },
];

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const paragraph = (value: string) => escapeHtml(value || 'Non renseigné').replaceAll('\n', '<br>');

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const completed = useMemo(() => {
    const checks = [form.meetingDate, form.electedMembers, form.opinion, form.information, form.findings, form.measures];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  const update = (field: keyof FormState, value: string) => { setForm((current) => ({ ...current, [field]: value })); setSubmitted(false); };

  const downloadOpinion = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!form.opinion) return;
    const opinionLabel = form.opinion === 'favorable' ? 'FAVORABLE' : 'DÉFAVORABLE';
    const accent = form.opinion === 'favorable' ? '#167b5b' : '#b43c32';
    const dateLabel = form.meetingDate ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${form.meetingDate}T12:00:00`)) : 'Non renseignée';
    const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Avis du CSE — ${escapeHtml(form.company)}</title>
<style>body{font-family:Arial,sans-serif;color:#17211d;max-width:820px;margin:0 auto;padding:48px 34px;line-height:1.55}header{border-bottom:3px solid ${accent};padding-bottom:24px;margin-bottom:32px}.eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#68736e}h1{font-size:32px;margin:8px 0}h2{font-size:18px;margin-top:30px}.decision{display:inline-block;border:2px solid ${accent};color:${accent};padding:10px 16px;font-weight:700;border-radius:8px}.meta{background:#f2f5f3;padding:16px 20px;border-radius:8px}footer{margin-top:48px;padding-top:20px;border-top:1px solid #ccd3cf;font-size:12px;color:#68736e}@media print{body{padding:0}}</style>
</head><body><header><p class="eyebrow">Exercice pédagogique · CSE de moins de 50 salariés</p><h1>Avis du comité social et économique</h1><p>Consultation sur la mise à jour du document unique d’évaluation des risques professionnels (DUERP)</p></header>
<div class="meta"><strong>Entreprise :</strong> ${escapeHtml(form.company)}<br><strong>Date de la réunion :</strong> ${escapeHtml(dateLabel)}<br><strong>Élus ayant participé :</strong> ${paragraph(form.electedMembers)}</div>
<h2>Décision du CSE</h2><p class="decision">AVIS ${opinionLabel}</p><h2>Qualité des informations reçues</h2><p>${paragraph(form.information)}</p><h2>Constats et analyse</h2><p>${paragraph(form.findings)}</p><h2>Mesures demandées à l’employeur</h2><p>${paragraph(form.measures)}</p><h2>Réserves éventuelles</h2><p>${paragraph(form.reservations)}</p><h2>Modalités de suivi</h2><p>${paragraph(form.followUp)}</p>
<footer>Document produit dans le cadre d’un cas fictif de formation. Il ne constitue pas un conseil juridique. Base pédagogique : article L. 4121-3 du Code du travail.</footer></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `avis-cse-${form.company.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.html`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
        <a className="header-link" href="/">Tous les ateliers</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Formation pratique · Atelier 01</p>
          <h1>Construisez un avis CSE clair, argumenté et utile.</h1>
          <p className="hero-intro">Étudiez une situation fictive, discutez en groupe, puis rédigez l’avis du CSE. À la fin, repartez avec votre document HTML prêt à être ouvert ou imprimé.</p>
          <a className="button primary" href="#cas-pratique">Commencer l’exercice <span aria-hidden="true">→</span></a>
        </div>
        <aside className="hero-card" aria-label="Aperçu de l’atelier">
          <div className="card-topline"><span>Cas fictif</span><span className="status-dot">Disponible</span></div>
          <p className="hero-card-number">01</p><h2>Rendre un avis sur le DUERP</h2><p>Entreprise de 34 salariés · 35 à 45 min · Travail en groupe</p>
          <div className="mini-steps" aria-hidden="true"><span className="active">1</span><i></i><span>2</span><i></i><span>3</span></div>
        </aside>
      </section>

      <section className="section scenario" id="cas-pratique">
        <div className="section-heading"><div><p className="eyebrow">Le contexte</p><h2>Élan Services met à jour son DUERP</h2></div><p className="section-note">Toutes les informations et tous les noms de cet exercice sont fictifs.</p></div>
        <div className="scenario-grid">
          <article className="case-sheet"><p className="case-label">Note remise aux élus</p><h3>Vous êtes membres du CSE d’Élan Services.</h3>
            <p>Après l’installation d’une nouvelle zone d’emballage et avant le pic d’activité, l’employeur présente la mise à jour annuelle du DUERP. Il demande au CSE de rendre un avis à la réunion du 18 septembre 2026.</p>
            <p>Le projet prévoit deux tables élévatrices, des bouchons d’oreille à disposition et un rappel des gestes de manutention. Aucun calendrier de mise en œuvre ni indicateur de suivi n’est fourni.</p>
            <div className="fact-grid">{scenarioFacts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          </article>
          <aside className="legal-card"><p className="eyebrow">Repère pédagogique</p><h3>Pourquoi le CSE est-il consulté ?</h3>
            <p>Le CSE, lorsqu’il existe, est consulté sur le DUERP et ses mises à jour. Dans une entreprise de 11 à 49 salariés, le document est mis à jour au moins chaque année.</p>
            <div className="legal-links"><a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893923" target="_blank" rel="noreferrer">Code du travail, art. L. 4121-3 ↗</a><a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023795559/" target="_blank" rel="noreferrer">Code du travail, art. R. 4121-2 ↗</a></div>
            <p className="disclaimer">Support de formation, à adapter au contexte réel. Il ne remplace pas un conseil juridique.</p>
          </aside>
        </div>
      </section>

      <section className="section risks">
        <div className="section-heading compact"><div><p className="eyebrow">Pièces à analyser</p><h2>Trois points ressortent du dossier</h2></div></div>
        <div className="risk-grid">{riskCards.map((risk, index) => <article className="risk-card" key={risk.title}><div className="risk-index">0{index + 1}</div><div><span className="risk-level">{risk.level}</span><h3>{risk.title}</h3><p>{risk.text}</p></div></article>)}</div>
        <div className="prompt-box"><strong>Question à débattre</strong><p>Les mesures proposées réduisent-elles suffisamment les risques ? Quelles informations ou garanties manque-t-il avant de rendre votre avis ?</p></div>
      </section>

      <section className="section workshop" id="atelier">
        <div className="workshop-header"><div><p className="eyebrow">Votre production</p><h2>Rédiger l’avis du CSE</h2></div><div className="progress" aria-label={`Formulaire complété à ${completed} %`}><span>{completed}% complété</span><div><i style={{ width: `${completed}%` }} /></div></div></div>
        <form onSubmit={downloadOpinion}>
          <fieldset className="form-section"><legend><span>1</span> Identifier la délibération</legend><div className="form-grid"><label>Entreprise<input value={form.company} onChange={(e) => update('company', e.target.value)} required /></label><label>Date de la réunion<input type="date" value={form.meetingDate} onChange={(e) => update('meetingDate', e.target.value)} required /></label></div><label>Élus ayant participé<textarea rows={2} value={form.electedMembers} onChange={(e) => update('electedMembers', e.target.value)} placeholder="Ex. : Marie Martin, titulaire ; Louis Robert, suppléant…" required /></label></fieldset>
          <fieldset className="form-section"><legend><span>2</span> Choisir le sens de l’avis</legend><div className="opinion-grid">
            <label className={`opinion-card positive ${form.opinion === 'favorable' ? 'selected' : ''}`}><input type="radio" name="opinion" value="favorable" checked={form.opinion === 'favorable'} onChange={() => update('opinion', 'favorable')} /><span className="opinion-icon" aria-hidden="true">+</span><strong>Avis favorable</strong><small>Le CSE approuve le projet, avec ou sans réserves.</small></label>
            <label className={`opinion-card negative ${form.opinion === 'defavorable' ? 'selected' : ''}`}><input type="radio" name="opinion" value="defavorable" checked={form.opinion === 'defavorable'} onChange={() => update('opinion', 'defavorable')} /><span className="opinion-icon" aria-hidden="true">−</span><strong>Avis défavorable</strong><small>Le CSE estime le projet insuffisant ou inadapté.</small></label>
          </div>{submitted && !form.opinion && <p className="error" role="alert">Choisissez un avis favorable ou défavorable.</p>}</fieldset>
          <fieldset className="form-section"><legend><span>3</span> Motiver et rendre l’avis</legend>
            <label>Les informations remises sont-elles suffisantes ?<textarea rows={3} value={form.information} onChange={(e) => update('information', e.target.value)} placeholder="Décrivez les documents reçus et les éventuelles informations manquantes…" required /></label>
            <label>Quels sont vos principaux constats ?<textarea rows={4} value={form.findings} onChange={(e) => update('findings', e.target.value)} placeholder="Reprenez les risques, les salariés exposés et votre analyse…" required /></label>
            <label>Quelles mesures demandez-vous à l’employeur ?<textarea rows={4} value={form.measures} onChange={(e) => update('measures', e.target.value)} placeholder="Formulez des demandes précises, mesurables et datées…" required /></label>
            <div className="form-grid"><label>Réserves éventuelles<textarea rows={3} value={form.reservations} onChange={(e) => update('reservations', e.target.value)} placeholder="Facultatif" /></label><label>Suivi proposé<textarea rows={3} value={form.followUp} onChange={(e) => update('followUp', e.target.value)} placeholder="Ex. : point de suivi dans 3 mois" /></label></div>
          </fieldset>
          <div className="download-panel"><div><p className="eyebrow">Dernière étape</p><h3>Télécharger l’avis au format HTML</h3><p>Le fichier s’ouvre dans tout navigateur et peut ensuite être imprimé ou enregistré en PDF.</p></div><button className="button primary" type="submit">Télécharger mon avis <span aria-hidden="true">↓</span></button></div>
        </form>
      </section>

      <footer className="footer"><div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div><p>Un outil pédagogique simple pour apprendre en faisant.</p><a href="#top">Retour en haut ↑</a></footer>
    </main>
  );
}
