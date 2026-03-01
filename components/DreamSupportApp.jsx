'use client';

import { useEffect, useMemo, useState } from 'react';
import { modeCards, modeTemplates, onboardingSteps, tabs } from '../lib/demo-data';
import { buildAutoTags, buildExportBundle, deriveInterpretation, derivePatterns, deriveWeeklyReview } from '../lib/lens-engine';
import { loadState, saveState } from '../lib/storage';

const defaultDreams = [];

const emptyReentry = {
  sceneReplay: '',
  bodySensation: '',
  affectShift: '',
  strangeReaction: '',
  smallDetail: '',
  integrationQuestion: '',
};

const emptyFollowThrough = {
  microAction: '',
  signalToTrack: '',
  checkInStatus: 'not-started',
  notes: '',
  lastUpdated: '',
};

function parseTags(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(value));
}

function buildFormFromMode(mode) {
  return { ...modeTemplates[mode], mode, tags: modeTemplates[mode].tags || '' };
}

function buildFormFromDream(dream) {
  return {
    mode: dream.mode,
    title: dream.title,
    narrative: dream.narrative,
    prevailingEmotion: dream.prevailingEmotion,
    ending: dream.ending,
    endingResolution: dream.endingResolution,
    knownPersonName: dream.knownPersonName || '',
    knownPersonRelationship: dream.knownPersonRelationship || '',
    knownPersonAssociations: dream.knownPersonAssociations || '',
    knownPersonAsPart: dream.knownPersonAsPart || '',
    tags: (dream.tags || []).join(', '),
    reading: dream.reading || '',
    integration: dream.integration || '',
  };
}

function buildReentryFromDream(dream) {
  return {
    sceneReplay: dream.reentry?.sceneReplay || '',
    bodySensation: dream.reentry?.bodySensation || '',
    affectShift: dream.reentry?.affectShift || '',
    strangeReaction: dream.reentry?.strangeReaction || '',
    smallDetail: dream.reentry?.smallDetail || '',
    integrationQuestion: dream.reentry?.integrationQuestion || '',
  };
}

function buildFollowThroughFromDream(dream) {
  const interpretation = deriveInterpretation(dream);
  return {
    microAction: dream.followThrough?.microAction || interpretation.microAction,
    signalToTrack: dream.followThrough?.signalToTrack || interpretation.signalToTrack,
    checkInStatus: dream.followThrough?.checkInStatus || 'not-started',
    notes: dream.followThrough?.notes || '',
    lastUpdated: dream.followThrough?.lastUpdated || '',
  };
}

function buildShareSummary(dreams, patterns) {
  if (!dreams.length) {
    return 'No dreams selected yet. Save a few dreams first, then choose which ones to include in a therapist-ready bundle.';
  }

  const selected = dreams.slice(0, 3);
  const titles = selected.map((dream) => dream.title).join('; ');
  return `${selected.length} dreams selected: ${titles}. Dominant recent emotional field: ${patterns.topEmotions}. Most common ending state: ${patterns.commonEnding}. Strongest known-person-as-inner-figure theme: ${patterns.topKnownFigureTheme}. Re-entry pattern: ${patterns.topReentryTheme}. Follow-through: ${patterns.followThroughRate}.`;
}

function Sidebar({ activeScreen, setActiveScreen, activeTab }) {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'capture', label: 'Capture' },
    { id: 'known-people', label: 'Known People' },
    { id: 'reentry-start', label: 'Re-entry Start' },
    { id: 'reentry-scene', label: 'Re-entry Scene' },
    { id: 'reentry-summary', label: 'Re-entry Summary' },
    { id: 'symbolic-flow', label: 'Symbolic Flow' },
    { id: 'grounded-flow', label: 'Grounded Flow' },
    { id: 'support-flow', label: 'Support Flow' },
    { id: 'archive', label: 'Archive' },
    { id: 'dream-detail', label: 'Dream Detail' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'weekly-review', label: 'Weekly Review' },
    { id: 'share', label: 'Therapist Share' },
  ];

  return (
    <aside className="sidebar-shell">
      <div className="sidebar-head">
        <div className="eyebrow main">Dream Support</div>
        <h2>App scaffold</h2>
        <p>Next app router structure with local persistence, archive management, multi-step dreamwork flow, pattern summaries, therapist-share flows, and known-person inner-figure handling.</p>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <button
            key={link.id}
            className={`sidebar-link ${activeScreen === link.id ? 'active' : ''}`}
            onClick={() => setActiveScreen(link.id)}
            type="button"
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-note">
        <div className="eyebrow">Current tab</div>
        <p>{tabs.find((tab) => tab.id === activeTab)?.label}</p>
      </div>
    </aside>
  );
}

function TabBar({ activeTab, setActiveScreen }) {
  const tabTargets = {
    home: 'home',
    archive: 'archive',
    patterns: 'patterns',
    share: 'share',
  };

  return (
    <nav className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveScreen(tabTargets[tab.id])}
        >
          <span className={`tab-icon ${tab.id}`} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function HomeScreen({ setActiveScreen }) {
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Private-First Dream Support</div>
      <h1>Dream work that compounds over time.</h1>
      <p className="intro">The app starts with a private archive, not a social layer. Value comes from recurring use: saved dreams, pattern memory, known-figure reflection, re-entry depth, and therapist-ready sharing.</p>
      <section className="hero-card">
        <div className="eyebrow">Product logic</div>
        <h3>Capture. Re-enter. Route. Remember.</h3>
        <p>The product should help with one dream immediately, then become more useful as it remembers prevailing emotions, ending states, what known people represent, and what becomes clearer during re-entry.</p>
      </section>
      <div className="card-grid">
        <button className="surface-card action-card" type="button" onClick={() => setActiveScreen('capture')}>
          <div className="eyebrow">Start</div>
          <h3>Begin a multi-step dream flow</h3>
          <p>Capture the dream, reflect on known people, move through re-entry, then save it into the archive.</p>
        </button>
        <button className="surface-card action-card" type="button" onClick={() => setActiveScreen('symbolic-flow')}>
          <div className="eyebrow">Modes</div>
          <h3>Compare symbolic, grounded, and support modes</h3>
          <p>The app should not make every dream feel like the same interpretive instrument.</p>
        </button>
        <button className="surface-card action-card" type="button" onClick={() => setActiveScreen('archive')}>
          <div className="eyebrow">Archive</div>
          <h3>See retained value over time</h3>
          <p>Archive, patterns, and therapist-share make the private record more useful as it grows.</p>
        </button>
        <button className="surface-card action-card" type="button" onClick={() => setActiveScreen('weekly-review')}>
          <div className="eyebrow">Review</div>
          <h3>See what still needs contact</h3>
          <p>Weekly review highlights dreams that remain unresolved, what has landed, and what deserves the next pass.</p>
        </button>
      </div>
    </div>
  );
}

function OnboardingScreen({ onboardingIndex, setOnboardingIndex, setActiveScreen }) {
  const step = onboardingSteps[onboardingIndex];
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Onboarding</div>
      <h1>{step.title}</h1>
      <p className="intro">{step.body}</p>
      <section className="hero-card">
        <div className="eyebrow">Step {onboardingIndex + 1} of {onboardingSteps.length}</div>
        <h3>{step.id === 'routing' ? 'Depth is conditional, not constant.' : 'Private by default, careful by design.'}</h3>
        <p>The onboarding should set the method and the tone before the user enters any dream material.</p>
      </section>
      <div className="button-stack">
        {onboardingIndex > 0 ? <button className="subtle-btn" type="button" onClick={() => setOnboardingIndex((value) => value - 1)}>Back</button> : null}
        {onboardingIndex < onboardingSteps.length - 1 ? (
          <button className="primary-btn" type="button" onClick={() => setOnboardingIndex((value) => value + 1)}>Continue</button>
        ) : (
          <button className="primary-btn" type="button" onClick={() => setActiveScreen('capture')}>Start setup</button>
        )}
      </div>
    </div>
  );
}

function CaptureScreen({ form, setForm, setActiveScreen, editMode }) {
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Capture</div>
      <h1>{editMode ? 'Edit the dream basics.' : 'Capture the dream before it fades.'}</h1>
      <p className="intro">Start with the raw dream, prevailing emotion, and ending state. Interpretation comes later.</p>
      <section className="surface-card form-card">
        <label>
          <span className="field-label">Dream mode</span>
          <select value={form.mode} onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value }))}>
            {modeCards.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
          </select>
        </label>
        <label>
          <span className="field-label">Title</span>
          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">Dream narrative</span>
          <textarea value={form.narrative} onChange={(event) => setForm((prev) => ({ ...prev, narrative: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">Prevailing emotion</span>
          <input value={form.prevailingEmotion} onChange={(event) => setForm((prev) => ({ ...prev, prevailingEmotion: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">Ending</span>
          <textarea className="short-textarea" value={form.ending} onChange={(event) => setForm((prev) => ({ ...prev, ending: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">Ending state</span>
          <input value={form.endingResolution} onChange={(event) => setForm((prev) => ({ ...prev, endingResolution: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">Tags (comma separated)</span>
          <input value={form.tags || ''} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} />
        </label>
      </section>
      <div className="mode-row">
        {modeCards.map((card) => (
          <button key={card.id} type="button" className={`chip ${form.mode === card.id ? 'active' : ''}`} onClick={() => setForm((prev) => ({ ...prev, ...modeTemplates[card.id], mode: card.id }))}>
            {card.label}
          </button>
        ))}
      </div>
      <div className="button-stack two-up">
        <button className="subtle-btn" type="button" onClick={() => setActiveScreen('home')}>Back</button>
        <button className="primary-btn" type="button" onClick={() => setActiveScreen('known-people')}>Continue</button>
      </div>
    </div>
  );
}

function KnownPeopleScreen({ form, setForm, setActiveScreen }) {
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Known People</div>
      <h1>Treat known people as inner figures first.</h1>
      <p className="intro">Before taking a familiar person literally, ask what they represent to you and what part of you they might embody.</p>
      <section className="surface-card form-card">
        <label>
          <span className="field-label">Known person in the dream</span>
          <input value={form.knownPersonName} onChange={(event) => setForm((prev) => ({ ...prev, knownPersonName: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">Relationship</span>
          <input value={form.knownPersonRelationship} onChange={(event) => setForm((prev) => ({ ...prev, knownPersonRelationship: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">What they represent to me</span>
          <input value={form.knownPersonAssociations} onChange={(event) => setForm((prev) => ({ ...prev, knownPersonAssociations: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">If they were a part of me</span>
          <textarea className="short-textarea" value={form.knownPersonAsPart} onChange={(event) => setForm((prev) => ({ ...prev, knownPersonAsPart: event.target.value }))} />
        </label>
      </section>
      <div className="button-stack two-up">
        <button className="subtle-btn" type="button" onClick={() => setActiveScreen('capture')}>Back</button>
        <button className="primary-btn" type="button" onClick={() => setActiveScreen('reentry-start')}>Continue to re-entry</button>
      </div>
    </div>
  );
}

function ReentryStartScreen({ form, setActiveScreen }) {
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Re-entry</div>
      <h1>Return slowly to the dream scene.</h1>
      <p className="intro">Use present tense and sensory language. The goal is to recover the dream more precisely, not to explain it yet.</p>
      <section className="hero-card">
        <div className="eyebrow">Induction</div>
        <h3>{form.mode === 'support' ? 'Stay grounded as you recall only what feels manageable.' : 'Replay the most vivid scene in present tense.'}</h3>
        <p>{form.mode === 'symbolic' ? 'Pay close attention to any emotional mismatch, strange calmness, or sudden shift in atmosphere.' : form.mode === 'grounded' ? 'Notice where the dream turns emotional pressure into a practical problem.' : 'If the dream is still physically activating, keep the recall narrow and stabilizing.'}</p>
      </section>
      <div className="button-stack two-up">
        <button className="subtle-btn" type="button" onClick={() => setActiveScreen('known-people')}>Back</button>
        <button className="primary-btn" type="button" onClick={() => setActiveScreen('reentry-scene')}>Replay scene</button>
      </div>
    </div>
  );
}

function ReentrySceneScreen({ reentryDraft, setReentryDraft, setActiveScreen }) {
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Re-entry Scene</div>
      <h1>Stay with the part that changed you.</h1>
      <p className="intro">Capture what became more vivid only when you replayed the dream more slowly.</p>
      <section className="surface-card form-card">
        <label>
          <span className="field-label">Replay the key scene in present tense</span>
          <textarea value={reentryDraft.sceneReplay} onChange={(event) => setReentryDraft((prev) => ({ ...prev, sceneReplay: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">What do you feel in your body?</span>
          <input value={reentryDraft.bodySensation} onChange={(event) => setReentryDraft((prev) => ({ ...prev, bodySensation: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">What changed emotionally from the moment before?</span>
          <input value={reentryDraft.affectShift} onChange={(event) => setReentryDraft((prev) => ({ ...prev, affectShift: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">What was strange about your reaction?</span>
          <textarea className="short-textarea" value={reentryDraft.strangeReaction} onChange={(event) => setReentryDraft((prev) => ({ ...prev, strangeReaction: event.target.value }))} />
        </label>
        <label>
          <span className="field-label">What small detail became more vivid?</span>
          <input value={reentryDraft.smallDetail} onChange={(event) => setReentryDraft((prev) => ({ ...prev, smallDetail: event.target.value }))} />
        </label>
      </section>
      <div className="button-stack two-up">
        <button className="subtle-btn" type="button" onClick={() => setActiveScreen('reentry-start')}>Back</button>
        <button className="primary-btn" type="button" onClick={() => setActiveScreen('reentry-summary')}>Review re-entry</button>
      </div>
    </div>
  );
}

function ReentrySummaryScreen({ form, reentryDraft, saveDream, setActiveScreen, editMode }) {
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Re-entry Summary</div>
      <h1>What deepened during replay.</h1>
      <p className="intro">This is where the app turns raw recall into a more usable record before storing it in the archive.</p>
      <section className="surface-card">
        <div className="eyebrow">Dream headline</div>
        <h3>{form.title}</h3>
        <p>Prevailing emotion: {form.prevailingEmotion}. Ending state: {form.endingResolution}.</p>
      </section>
      <section className="surface-card">
        <div className="eyebrow">Recovered through re-entry</div>
        <p><strong>Scene:</strong> {reentryDraft.sceneReplay || 'Not yet captured.'}</p>
        <p><strong>Body:</strong> {reentryDraft.bodySensation || 'Not yet captured.'}</p>
        <p><strong>Affect shift:</strong> {reentryDraft.affectShift || 'Not yet captured.'}</p>
        <p><strong>Strange reaction:</strong> {reentryDraft.strangeReaction || 'Not yet captured.'}</p>
        <p><strong>Small detail:</strong> {reentryDraft.smallDetail || 'Not yet captured.'}</p>
      </section>
      <section className="surface-card form-card">
        <label>
          <span className="field-label">One integration question to carry forward</span>
          <textarea className="short-textarea" value={reentryDraft.integrationQuestion} onChange={(event) => setReentryDraft((prev) => ({ ...prev, integrationQuestion: event.target.value }))} />
        </label>
      </section>
      <div className="button-stack two-up">
        <button className="subtle-btn" type="button" onClick={() => setActiveScreen('reentry-scene')}>Back</button>
        <button className="primary-btn" type="button" onClick={saveDream}>{editMode ? 'Update dream' : 'Save into archive'}</button>
      </div>
    </div>
  );
}

function FlowScreen({ title, intro, sections, ctaLabel, ctaAction }) {
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Dream Flow</div>
      <h1>{title}</h1>
      <p className="intro">{intro}</p>
      {sections.map((section) => (
        <section className="surface-card" key={section.label}>
          <div className="eyebrow">{section.label}</div>
          <h3>{section.title}</h3>
          <p>{section.body}</p>
        </section>
      ))}
      <div className="button-stack">
        <button className="primary-btn" type="button" onClick={ctaAction}>{ctaLabel}</button>
      </div>
    </div>
  );
}

function ArchiveScreen({
  dreams,
  setActiveScreen,
  onEditDream,
  onDeleteDream,
  onOpenDream,
  archiveQuery,
  setArchiveQuery,
  selectedTag,
  setSelectedTag,
  availableTags,
}) {
  if (!dreams.length) {
    return (
      <div className="screen-shell">
        <div className="eyebrow main">Archive</div>
        <h1>A realistic empty state.</h1>
        <p className="intro">The app should feel calm and invitational before any dream history exists. It should make clear what will accumulate over time, including recurring inner-figure and re-entry patterns.</p>
        <section className="hero-card">
          <div className="eyebrow">No dreams saved yet</div>
          <h3>Your archive starts here.</h3>
          <p>Once the first dream is saved, the app can begin tracking prevailing emotion, ending state, recurring motifs, known-figure themes, and what becomes visible in re-entry.</p>
        </section>
        <div className="button-stack two-up">
          <button className="subtle-btn" type="button" onClick={() => setActiveScreen('home')}>Back home</button>
          <button className="primary-btn" type="button" onClick={() => setActiveScreen('capture')}>Record first dream</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-shell">
      <div className="eyebrow main">Archive</div>
      <h1>Your private dream timeline.</h1>
      <p className="intro">The archive becomes the retained-value layer. It should reveal continuity across weeks, including which familiar people recur as inner figures and what re-entry adds.</p>
      <section className="surface-card form-card">
        <label>
          <span className="field-label">Search dreams</span>
          <input value={archiveQuery} onChange={(event) => setArchiveQuery(event.target.value)} placeholder="Search title, narrative, person, or tag" />
        </label>
        <div>
          <div className="field-label">Filter by tag</div>
          <div className="mode-row">
            <button type="button" className={`chip ${selectedTag === '' ? 'active' : ''}`} onClick={() => setSelectedTag('')}>
              All
            </button>
            {availableTags.map((tag) => (
              <button key={tag} type="button" className={`chip ${selectedTag === tag ? 'active' : ''}`} onClick={() => setSelectedTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>
      {!dreams.length ? <section className="surface-card"><p>No dreams match the current search or tag filter.</p></section> : null}
      <div className="timeline-list">
        {dreams.map((dream) => (
          <article className="surface-card timeline-card rich-timeline-card" key={dream.id}>
            <div className="timeline-date">{formatDate(dream.createdAt)}</div>
            <div>
              <h3>{dream.title}</h3>
              <p>{dream.prevailingEmotion}. Ending: {dream.endingResolution}. Mode: {dream.mode}.</p>
              <div className="tag-row">
                {[...buildAutoTags(dream), ...(dream.tags || [])].map((tag) => (
                  <span key={`${dream.id}-${tag}`} className="tag-pill">{tag}</span>
                ))}
              </div>
              {dream.followThrough?.checkInStatus && dream.followThrough.checkInStatus !== 'not-started' ? (
                <p><strong>Follow-through:</strong> {dream.followThrough.checkInStatus}</p>
              ) : null}
              {dream.knownPersonName ? <p><strong>{dream.knownPersonName}</strong> as inner figure: {dream.knownPersonAsPart || dream.knownPersonAssociations}.</p> : null}
              {dream.reentry?.smallDetail ? <p><strong>Re-entry detail:</strong> {dream.reentry.smallDetail}</p> : null}
              <div className="inline-actions">
                <button className="subtle-btn small-btn" type="button" onClick={() => onOpenDream(dream.id)}>Open</button>
                <button className="subtle-btn small-btn" type="button" onClick={() => onEditDream(dream.id)}>Edit</button>
                <button className="subtle-btn small-btn danger-btn" type="button" onClick={() => onDeleteDream(dream.id)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function DreamDetailScreen({ dream, setActiveScreen, onEditDream, onUpdateFollowThrough, onAnalyzeDream, analyzingDreamId }) {
  if (!dream) {
    return (
      <div className="screen-shell">
        <div className="eyebrow main">Dream Detail</div>
        <h1>No dream selected.</h1>
        <p className="intro">Choose a dream from the archive to inspect its capture, re-entry, and integration material.</p>
      </div>
    );
  }

  return (
    <div className="screen-shell">
      {(() => {
        const interpretation = deriveInterpretation(dream);
        return (
          <>
      <div className="eyebrow main">Dream Detail</div>
      <h1>{dream.title}</h1>
      <p className="intro">This view gathers the raw dream, known-person reflection, re-entry material, and final integration question into one place.</p>
      <section className="hero-card">
        <div className="eyebrow">Saved {formatDate(dream.createdAt)}</div>
        <h3>{dream.prevailingEmotion}</h3>
        <p>Ending: {dream.ending}. Ending state: {dream.endingResolution}.</p>
      </section>
      <section className="surface-card">
        <div className="eyebrow">Dream text</div>
        <p>{dream.narrative}</p>
        <div className="tag-row">
          {[...buildAutoTags(dream), ...(dream.tags || [])].map((tag) => (
            <span key={`${dream.id}-detail-${tag}`} className="tag-pill">{tag}</span>
          ))}
        </div>
      </section>
      {dream.knownPersonName ? (
        <section className="surface-card">
          <div className="eyebrow">Known person</div>
          <h3>{dream.knownPersonName}</h3>
          <p><strong>Relationship:</strong> {dream.knownPersonRelationship}</p>
          <p><strong>Represents to me:</strong> {dream.knownPersonAssociations}</p>
          <p><strong>Part of me:</strong> {dream.knownPersonAsPart}</p>
        </section>
      ) : null}
      <section className="surface-card">
        <div className="eyebrow">Re-entry</div>
        <p><strong>Scene replay:</strong> {dream.reentry?.sceneReplay || 'Not captured.'}</p>
        <p><strong>Body sensation:</strong> {dream.reentry?.bodySensation || 'Not captured.'}</p>
        <p><strong>Affect shift:</strong> {dream.reentry?.affectShift || 'Not captured.'}</p>
        <p><strong>Strange reaction:</strong> {dream.reentry?.strangeReaction || 'Not captured.'}</p>
        <p><strong>Small detail:</strong> {dream.reentry?.smallDetail || 'Not captured.'}</p>
      </section>
      <section className="surface-card">
        <div className="eyebrow">Interpretation</div>
        <h3>{interpretation.lens}</h3>
        <p>{interpretation.routeReason}</p>
        <p><strong>Secondary lens:</strong> {interpretation.secondaryLens}. <strong>Confidence:</strong> {interpretation.routeConfidence}.</p>
        <ul className="bullet-list compact-list">
          {interpretation.routeEvidence.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p><strong>{interpretation.headline}</strong></p>
        <div className="interpretation-grid">
          <article>
            <div className="field-label">Observations</div>
            <ul className="bullet-list">
              {interpretation.observations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article>
            <div className="field-label">Working hypotheses</div>
            <ul className="bullet-list">
              {interpretation.hypotheses.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </div>
        <article className="followup-section">
          <div className="field-label">Questions to hold</div>
          <ul className="bullet-list">
            {interpretation.questions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <div className="inline-actions">
          <button className="primary-btn small-btn" type="button" onClick={() => onAnalyzeDream(dream.id)} disabled={analyzingDreamId === dream.id}>
            {analyzingDreamId === dream.id ? 'Analyzing...' : 'Run deeper analysis'}
          </button>
        </div>
      </section>
      {dream.aiAnalysis ? (
        <section className="surface-card">
          <div className="eyebrow">OpenAI Analysis</div>
          <h3>{dream.aiAnalysis.primaryLens}</h3>
          <p><strong>Source:</strong> {dream.aiAnalysis.source}</p>
          {dream.aiAnalysis.fallbackReason ? <p><strong>Fallback reason:</strong> {dream.aiAnalysis.fallbackReason}</p> : null}
          {dream.aiAnalysis.debug ? (
            <p>
              <strong>Debug:</strong>{' '}
              key={String(dream.aiAnalysis.debug.hasOpenAiKey)}, model={String(dream.aiAnalysis.debug.hasOpenAiModel)}, env={dream.aiAnalysis.debug.vercelEnv}, url={dream.aiAnalysis.debug.vercelUrl}
            </p>
          ) : null}
          <p>{dream.aiAnalysis.routeReason}</p>
          <p><strong>Secondary lens:</strong> {dream.aiAnalysis.secondaryLens}. <strong>Confidence:</strong> {dream.aiAnalysis.confidence}.</p>
          <p><strong>{dream.aiAnalysis.headline}</strong></p>
          <p><strong>Atmosphere:</strong> {dream.aiAnalysis.atmosphere}</p>
          <div className="interpretation-grid">
            <article>
              <div className="field-label">Route evidence</div>
              <ul className="bullet-list">
                {(dream.aiAnalysis.routeEvidence || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article>
              <div className="field-label">Observations</div>
              <ul className="bullet-list">
                {(dream.aiAnalysis.observations || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article>
              <div className="field-label">Hypotheses</div>
              <ul className="bullet-list">
                {(dream.aiAnalysis.hypotheses || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article>
              <div className="field-label">Disconfirming cues</div>
              <ul className="bullet-list">
                {(dream.aiAnalysis.disconfirmingCues || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </div>
          <article className="followup-section">
            <div className="field-label">Questions to hold</div>
            <ul className="bullet-list">
              {(dream.aiAnalysis.questionsToHold || []).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article className="followup-section">
            <div className="field-label">Humility note</div>
            <p>{dream.aiAnalysis.humilityNote}</p>
          </article>
        </section>
      ) : null}
      <section className="surface-card form-card">
        <div className="eyebrow">Follow-through defaults</div>
        {dream.aiAnalysis ? (
          <>
            <p><strong>Micro-action:</strong> {dream.aiAnalysis.microAction}</p>
            <p><strong>Signal to track:</strong> {dream.aiAnalysis.signalToTrack}</p>
          </>
        ) : (
          <>
            <p><strong>Micro-action:</strong> {interpretation.microAction}</p>
            <p><strong>Signal to track:</strong> {interpretation.signalToTrack}</p>
          </>
        )}
      </section>
      <section className="surface-card form-card">
        <div className="eyebrow">Weekly follow-through</div>
        <label>
          <span className="field-label">Micro-action</span>
          <textarea
            className="short-textarea"
            value={dream.followThrough?.microAction || interpretation.microAction}
            onChange={(event) => onUpdateFollowThrough(dream.id, { microAction: event.target.value })}
          />
        </label>
        <label>
          <span className="field-label">Signal to track</span>
          <textarea
            className="short-textarea"
            value={dream.followThrough?.signalToTrack || interpretation.signalToTrack}
            onChange={(event) => onUpdateFollowThrough(dream.id, { signalToTrack: event.target.value })}
          />
        </label>
        <label>
          <span className="field-label">Check-in status</span>
          <select
            value={dream.followThrough?.checkInStatus || 'not-started'}
            onChange={(event) => onUpdateFollowThrough(dream.id, { checkInStatus: event.target.value })}
          >
            <option value="not-started">Not started</option>
            <option value="in-progress">In progress</option>
            <option value="landed">Landed</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          <span className="field-label">Check-in notes</span>
          <textarea
            className="short-textarea"
            value={dream.followThrough?.notes || ''}
            onChange={(event) => onUpdateFollowThrough(dream.id, { notes: event.target.value })}
          />
        </label>
      </section>
      <div className="button-stack two-up">
        <button className="subtle-btn" type="button" onClick={() => setActiveScreen('archive')}>Back to archive</button>
        <button className="primary-btn" type="button" onClick={() => onEditDream(dream.id)}>Edit dream</button>
      </div>
          </>
        );
      })()}
    </div>
  );
}

function PatternsScreen({ patterns }) {
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Patterns</div>
      <h1>What is repeating?</h1>
      <p className="intro">This screen is the retention engine. It turns private dream logging into recurring emotional, symbolic, relational, and re-entry structure.</p>
      <section className="stats-grid patterns-grid">
        <article className="surface-card stat-card">
          <div className="eyebrow">Top emotions</div>
          <div className="stat-value">{patterns.topEmotions}</div>
          <p>Most common recent emotional field.</p>
        </article>
        <article className="surface-card stat-card">
          <div className="eyebrow">Common ending</div>
          <div className="stat-value">{patterns.commonEnding}</div>
          <p>Current dominant ending state.</p>
        </article>
        <article className="surface-card stat-card wide-card">
          <div className="eyebrow">Known-person theme</div>
          <div className="stat-value small-value">{patterns.topKnownFigureTheme}</div>
          <p>The strongest recurring “person as part of me” pattern across saved dreams.</p>
        </article>
        <article className="surface-card stat-card wide-card">
          <div className="eyebrow">Re-entry theme</div>
          <div className="stat-value small-value">{patterns.topReentryTheme}</div>
          <p>The strongest recurring theme in what feels strange or newly visible during replay.</p>
        </article>
        <article className="surface-card stat-card wide-card">
          <div className="eyebrow">Follow-through</div>
          <div className="stat-value small-value">{patterns.followThroughRate}</div>
          <p>Whether integration prompts are being marked as landed or completed over time.</p>
        </article>
      </section>
      <section className="hero-card">
        <div className="eyebrow">Weekly note</div>
        <h3>Pattern memory, not just dream storage.</h3>
        <p>{patterns.note}</p>
      </section>
    </div>
  );
}

function WeeklyReviewScreen({ review, onOpenDream }) {
  const sections = [
    { label: 'Needs review', items: review.needingReview },
    { label: 'Landing well', items: review.landingWell },
    { label: 'Still unresolved', items: review.unresolvedDreams },
  ];

  return (
    <div className="screen-shell">
      <div className="eyebrow main">Weekly Review</div>
      <h1>Review what still needs contact.</h1>
      <p className="intro">{review.prompt}</p>
      {sections.map((section) => (
        <section className="surface-card" key={section.label}>
          <div className="eyebrow">{section.label}</div>
          {section.items.length ? (
            <div className="review-stack">
              {section.items.map((item) => (
                <article key={item.id} className="review-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.reason}</p>
                  </div>
                  <button className="subtle-btn small-btn" type="button" onClick={() => onOpenDream(item.id)}>Open</button>
                </article>
              ))}
            </div>
          ) : (
            <p>Nothing in this section right now.</p>
          )}
        </section>
      ))}
    </div>
  );
}

function ShareScreen({ shareSummary, dreams, selectedShareIds, onToggleShareDream, onDownloadBundle }) {
  return (
    <div className="screen-shell">
      <div className="eyebrow main">Therapist Share</div>
      <h1>Prepare selected dreams for 1:1 work.</h1>
      <p className="intro">This mode should export a concise, clinically useful packet rather than dumping the entire archive.</p>
      <section className="surface-card">
        <div className="eyebrow">Select dreams</div>
        {dreams.length ? (
          <div className="checklist-stack">
            {dreams.map((dream) => (
              <label key={dream.id} className="checkbox-row">
                <input type="checkbox" checked={selectedShareIds.includes(dream.id)} onChange={() => onToggleShareDream(dream.id)} />
                <span>{dream.title} · {dream.prevailingEmotion}</span>
              </label>
            ))}
          </div>
        ) : (
          <p>No dreams saved yet.</p>
        )}
      </section>
      <section className="surface-card checklist-card">
        <div className="check-row"><span>Include raw dream text</span><span className="dot" /></div>
        <div className="check-row"><span>Include prevailing emotion and ending state</span><span className="dot" /></div>
        <div className="check-row"><span>Include known-person inner-figure notes</span><span className="dot" /></div>
        <div className="check-row"><span>Include re-entry observations</span><span className="dot" /></div>
        <div className="check-row"><span>Include weekly pattern note</span><span className="dot" /></div>
      </section>
      <section className="hero-card">
        <div className="eyebrow">Preview bundle</div>
        <h3>{dreams.length ? `${selectedShareIds.length} dream bundle ready` : 'No share bundle yet'}</h3>
        <p>{shareSummary}</p>
      </section>
      <div className="button-stack two-up">
        <button className="subtle-btn" type="button" onClick={() => onDownloadBundle('txt')} disabled={!dreams.length}>Download .txt</button>
        <button className="primary-btn" type="button" onClick={() => onDownloadBundle('json')} disabled={!dreams.length}>Download .json</button>
      </div>
    </div>
  );
}

export default function DreamSupportApp() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [dreams, setDreams] = useState(defaultDreams);
  const [form, setForm] = useState(buildFormFromMode('symbolic'));
  const [editingDreamId, setEditingDreamId] = useState(null);
  const [selectedDreamId, setSelectedDreamId] = useState(null);
  const [reentryDraft, setReentryDraft] = useState(emptyReentry);
  const [followThroughDraft, setFollowThroughDraft] = useState(emptyFollowThrough);
  const [analyzingDreamId, setAnalyzingDreamId] = useState(null);
  const [archiveQuery, setArchiveQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [shareIds, setShareIds] = useState([]);

  useEffect(() => {
    const saved = loadState();
    if (!saved) return;
    if (saved.dreams) setDreams(saved.dreams);
    if (saved.form) setForm(saved.form);
    if (saved.reentryDraft) setReentryDraft(saved.reentryDraft);
    if (saved.followThroughDraft) setFollowThroughDraft(saved.followThroughDraft);
    if (saved.activeScreen) setActiveScreen(saved.activeScreen);
    if (typeof saved.onboardingIndex === 'number') setOnboardingIndex(saved.onboardingIndex);
    if (saved.editingDreamId) setEditingDreamId(saved.editingDreamId);
    if (saved.selectedDreamId) setSelectedDreamId(saved.selectedDreamId);
    if (typeof saved.archiveQuery === 'string') setArchiveQuery(saved.archiveQuery);
    if (typeof saved.selectedTag === 'string') setSelectedTag(saved.selectedTag);
    if (Array.isArray(saved.shareIds)) setShareIds(saved.shareIds);
  }, []);

  useEffect(() => {
    saveState({ dreams, form, reentryDraft, followThroughDraft, activeScreen, onboardingIndex, editingDreamId, selectedDreamId, archiveQuery, selectedTag, shareIds });
  }, [dreams, form, reentryDraft, followThroughDraft, activeScreen, onboardingIndex, editingDreamId, selectedDreamId, archiveQuery, selectedTag, shareIds]);

  const activeTab = useMemo(() => {
    if (['archive', 'first-dream-saved', 'dream-detail'].includes(activeScreen)) return 'archive';
    if (['patterns', 'weekly-review'].includes(activeScreen)) return 'patterns';
    if (activeScreen === 'share') return 'share';
    return 'home';
  }, [activeScreen]);

  const patterns = useMemo(() => derivePatterns(dreams), [dreams]);
  const weeklyReview = useMemo(() => deriveWeeklyReview(dreams), [dreams]);
  const selectedDream = useMemo(() => dreams.find((dream) => dream.id === selectedDreamId) || null, [dreams, selectedDreamId]);
  const availableTags = useMemo(
    () =>
      [...new Set(dreams.flatMap((dream) => [...buildAutoTags(dream), ...(dream.tags || [])]))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [dreams],
  );
  const filteredDreams = useMemo(() => {
    const needle = archiveQuery.trim().toLowerCase();
    return dreams.filter((dream) => {
      const tags = [...buildAutoTags(dream), ...(dream.tags || [])];
      const haystack = [
        dream.title,
        dream.narrative,
        dream.prevailingEmotion,
        dream.endingResolution,
        dream.knownPersonName,
        dream.knownPersonAssociations,
        dream.knownPersonAsPart,
        tags.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      const matchesTag = !selectedTag || tags.includes(selectedTag);
      return matchesQuery && matchesTag;
    });
  }, [dreams, archiveQuery, selectedTag]);
  const selectedShareIds = useMemo(() => (shareIds.length ? shareIds : dreams.slice(0, 3).map((dream) => dream.id)), [dreams, shareIds]);
  const selectedShareDreams = useMemo(() => dreams.filter((dream) => selectedShareIds.includes(dream.id)), [dreams, selectedShareIds]);
  const shareSummary = useMemo(() => buildShareSummary(selectedShareDreams, patterns), [selectedShareDreams, patterns]);

  function resetWizard(mode = form.mode) {
    setForm(buildFormFromMode(mode));
    setReentryDraft(emptyReentry);
    setFollowThroughDraft(emptyFollowThrough);
    setEditingDreamId(null);
  }

  function saveDream() {
    const baseDream = {
      ...form,
      tags: parseTags(form.tags || ''),
      reentry: { ...reentryDraft },
    };
    const seededFollowThrough = buildFollowThroughFromDream(baseDream);
    const payload = {
      ...baseDream,
      followThrough: {
        ...seededFollowThrough,
        ...followThroughDraft,
      },
    };

    if (editingDreamId) {
      setDreams((existing) => existing.map((dream) => (dream.id === editingDreamId ? { ...dream, ...payload } : dream)));
      setEditingDreamId(null);
      setSelectedDreamId(editingDreamId);
      setActiveScreen('dream-detail');
      return;
    }

    const dream = {
      id: `${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    setDreams((existing) => [dream, ...existing]);
    setShareIds((existing) => (existing.length ? existing : [dream.id]));
    setSelectedDreamId(dream.id);
    setActiveScreen('first-dream-saved');
  }

  function handleEditDream(id) {
    const dream = dreams.find((entry) => entry.id === id);
    if (!dream) return;
    setForm(buildFormFromDream(dream));
    setReentryDraft(buildReentryFromDream(dream));
    setFollowThroughDraft(buildFollowThroughFromDream(dream));
    setEditingDreamId(id);
    setActiveScreen('capture');
  }

  function handleDeleteDream(id) {
    setDreams((existing) => existing.filter((dream) => dream.id !== id));
    setShareIds((existing) => existing.filter((value) => value !== id));
    if (selectedDreamId === id) {
      setSelectedDreamId(null);
      setActiveScreen('archive');
    }
  }

  function handleOpenDream(id) {
    setSelectedDreamId(id);
    setActiveScreen('dream-detail');
  }

  function handleToggleShareDream(id) {
    setShareIds((existing) => (existing.includes(id) ? existing.filter((value) => value !== id) : [...existing, id]));
  }

  function handleUpdateFollowThrough(id, patch) {
    setDreams((existing) =>
      existing.map((dream) =>
        dream.id === id
          ? {
              ...dream,
              followThrough: {
                ...(dream.followThrough || buildFollowThroughFromDream(dream)),
                ...patch,
                lastUpdated: new Date().toISOString(),
              },
            }
          : dream,
      ),
    );
  }

  async function handleAnalyzeDream(id) {
    const dream = dreams.find((entry) => entry.id === id);
    if (!dream) return;
    setAnalyzingDreamId(id);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.analysis) {
        throw new Error(payload.error || 'Analysis request failed.');
      }
      setDreams((existing) =>
        existing.map((entry) => (entry.id === id ? { ...entry, aiAnalysis: payload.analysis } : entry)),
      );
    } catch (error) {
      const fallback = deriveInterpretation(dream);
      setDreams((existing) =>
        existing.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                aiAnalysis: {
                  source: 'local-fallback',
                  fallbackReason: error instanceof Error ? error.message : 'Unknown analysis error.',
                  ...fallback,
                  primaryLens: fallback.lens,
                  confidence: fallback.routeConfidence || 'medium',
                  questionsToHold: fallback.questions,
                  disconfirmingCues: [
                    'This fallback analysis is local and should be revised once server-side analysis is available.',
                  ],
                  humilityNote: 'Treat this as a working lens, not a verdict.',
                  atmosphere: dream.prevailingEmotion,
                },
              }
            : entry,
        ),
      );
    } finally {
      setAnalyzingDreamId(null);
    }
  }

  function handleDownloadBundle(format) {
    const bundle = buildExportBundle(selectedShareDreams, patterns);
    const payload = format === 'json' ? JSON.stringify(bundle.json, null, 2) : bundle.text;
    const blob = new Blob([payload], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dream-support-bundle.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  let content = null;
  if (activeScreen === 'home') content = <HomeScreen setActiveScreen={setActiveScreen} />;
  if (activeScreen === 'onboarding') content = <OnboardingScreen onboardingIndex={onboardingIndex} setOnboardingIndex={setOnboardingIndex} setActiveScreen={setActiveScreen} />;
  if (activeScreen === 'capture') content = <CaptureScreen form={form} setForm={setForm} setActiveScreen={setActiveScreen} editMode={Boolean(editingDreamId)} />;
  if (activeScreen === 'known-people') content = <KnownPeopleScreen form={form} setForm={setForm} setActiveScreen={setActiveScreen} />;
  if (activeScreen === 'reentry-start') content = <ReentryStartScreen form={form} setActiveScreen={setActiveScreen} />;
  if (activeScreen === 'reentry-scene') content = <ReentrySceneScreen reentryDraft={reentryDraft} setReentryDraft={setReentryDraft} setActiveScreen={setActiveScreen} />;
  if (activeScreen === 'reentry-summary') content = <ReentrySummaryScreen form={form} reentryDraft={reentryDraft} saveDream={saveDream} setActiveScreen={setActiveScreen} editMode={Boolean(editingDreamId)} />;
  if (activeScreen === 'symbolic-flow') {
    content = <FlowScreen title="Symbolic flow" intro="Use this when the dream is numinous, imagistically strange, or emotionally disproportionate to waking concerns." sections={[{ label: 'Capture', title: 'Prevailing emotion and ending first', body: 'The app starts from the emotional field and ending state before jumping to symbolism.' }, { label: 'Known person', title: 'Inner figure before literal person', body: 'If someone familiar appears, the app asks what they represent before taking them literally.' }, { label: 'Re-entry', title: 'Replay in present tense', body: 'Scene-by-scene replay helps recover body sensation, affect mismatch, and small details.' }, { label: 'Interpretation', title: 'Split inner and outer readings', body: 'Symbolic hypotheses are grounded in exact dream images and transitions.' }]} ctaLabel="Try symbolic example" ctaAction={() => { resetWizard('symbolic'); setActiveScreen('capture'); }} />;
  }
  if (activeScreen === 'grounded-flow') {
    content = <FlowScreen title="Grounded flow" intro="Use this when the dream is close to waking stress, attachment strain, overload, lateness, or loss." sections={[{ label: 'Trigger', title: 'Emotional trigger before logistics', body: 'The app distinguishes what emotionally sets the dream in motion from the practical problem that takes over.' }, { label: 'Known person', title: 'Inner figure before literal person', body: 'Familiar figures are still explored as parts of the dreamer before literal interpretation.' }, { label: 'Re-entry', title: 'Recover the pressure point', body: 'Replay helps clarify where emotional strain becomes hurry, confusion, or task pressure.' }, { label: 'Reading', title: 'Stay close to continuity', body: 'The aim is practical truth, not over-symbolization.' }]} ctaLabel="Try grounded example" ctaAction={() => { resetWizard('grounded'); setActiveScreen('capture'); }} />;
  }
  if (activeScreen === 'support-flow') {
    content = <FlowScreen title="Support-first flow" intro="Use this when the dream is still physically activating or when shame, grief, helplessness, or panic are too high for interpretation." sections={[{ label: 'Distress check', title: 'Containment before meaning', body: 'The app first checks whether interpretation is appropriate at all.' }, { label: 'Known person', title: 'Only if useful and safe', body: 'The app does not force inner-figure work while the user is dysregulated.' }, { label: 'Re-entry', title: 'Keep replay narrow', body: 'Only the manageable portion of the dream is revisited.' }, { label: 'Later review', title: 'Save minimally, revisit safely', body: 'The strongest image, prevailing emotion, and ending state are kept for later work.' }]} ctaLabel="Try support example" ctaAction={() => { resetWizard('support'); setActiveScreen('capture'); }} />;
  }
  if (activeScreen === 'archive') {
    content = (
      <ArchiveScreen
        dreams={filteredDreams}
        setActiveScreen={setActiveScreen}
        onEditDream={handleEditDream}
        onDeleteDream={handleDeleteDream}
        onOpenDream={handleOpenDream}
        archiveQuery={archiveQuery}
        setArchiveQuery={setArchiveQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        availableTags={availableTags}
      />
    );
  }
  if (activeScreen === 'dream-detail') {
    content = (
      <DreamDetailScreen
        dream={selectedDream}
        setActiveScreen={setActiveScreen}
        onEditDream={handleEditDream}
        onUpdateFollowThrough={handleUpdateFollowThrough}
        onAnalyzeDream={handleAnalyzeDream}
        analyzingDreamId={analyzingDreamId}
      />
    );
  }
  if (activeScreen === 'first-dream-saved') {
    content = (
      <div className="screen-shell">
        <div className="eyebrow main">Archive Started</div>
        <h1>The archive becomes personal with the first entry.</h1>
        <p className="intro">This moment should feel quietly significant rather than gamified. The product now contains remembered material, a first inner-figure reflection, and a first re-entry record.</p>
        <section className="hero-card">
          <div className="eyebrow">Saved</div>
          <h3>{dreams[0]?.title}</h3>
          <p>{dreams[0]?.prevailingEmotion}. Ending: {dreams[0]?.endingResolution}.</p>
          {dreams[0]?.knownPersonName ? <p><strong>{dreams[0]?.knownPersonName}</strong> first reflected as: {dreams[0]?.knownPersonAsPart}.</p> : null}
          {dreams[0]?.reentry?.smallDetail ? <p><strong>Re-entry detail:</strong> {dreams[0]?.reentry?.smallDetail}</p> : null}
        </section>
        <div className="button-stack two-up">
          <button className="subtle-btn" type="button" onClick={() => setActiveScreen('dream-detail')}>Open detail</button>
          <button className="primary-btn" type="button" onClick={() => setActiveScreen('archive')}>See archive</button>
        </div>
      </div>
    );
  }
  if (activeScreen === 'patterns') content = <PatternsScreen patterns={patterns} />;
  if (activeScreen === 'weekly-review') content = <WeeklyReviewScreen review={weeklyReview} onOpenDream={handleOpenDream} />;
  if (activeScreen === 'share') {
    content = (
      <ShareScreen
        shareSummary={shareSummary}
        dreams={dreams}
        selectedShareIds={selectedShareIds}
        onToggleShareDream={handleToggleShareDream}
        onDownloadBundle={handleDownloadBundle}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} activeTab={activeTab} />
      <main className="phone-shell">
        <div className="phone-frame">
          <header className="statusbar">
            <span>9:41</span>
            <span>Dream Support</span>
          </header>
          <section className={`screen ${activeTab}`}>{content}</section>
          <TabBar activeTab={activeTab} setActiveScreen={setActiveScreen} />
        </div>
      </main>
    </div>
  );
}
