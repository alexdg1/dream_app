function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function buildAutoTags(dream) {
  const tags = [dream.mode, dream.endingResolution];
  if (dream.knownPersonName) tags.push(dream.knownPersonName);
  if (dream.prevailingEmotion) {
    const emotionTag = dream.prevailingEmotion.split(/[.,/]/)[0]?.trim();
    if (emotionTag) tags.push(emotionTag);
  }
  if (dream.followThrough?.checkInStatus && dream.followThrough.checkInStatus !== 'not-started') {
    tags.push(`follow-up:${dream.followThrough.checkInStatus}`);
  }
  return unique(tags);
}

function knownFigureLine(dream) {
  if (!dream.knownPersonName) return 'No known figure was marked as central.';
  const part = dream.knownPersonAsPart || dream.knownPersonAssociations || 'an inner figure';
  return `${dream.knownPersonName} is first approached as ${part}.`;
}

function determineLensRoute(dream) {
  const evidence = [];
  let primaryLens = 'Symbolic / depth lens';
  let secondaryLens = 'Known-person inner-figure lens';
  let confidence = 'medium';

  const emotion = (dream.prevailingEmotion || '').toLowerCase();
  const ending = (dream.endingResolution || '').toLowerCase();
  const strangeReaction = dream.reentry?.strangeReaction || '';
  const affectShift = dream.reentry?.affectShift || '';

  if (dream.mode === 'support' || /shame|grief|helpless|panic|terror|distress/.test(emotion) || /uncontained|crisis/.test(ending)) {
    primaryLens = 'Nightmare / support-first lens';
    secondaryLens = dream.knownPersonName ? 'Known-person inner-figure lens' : 'Grounding / continuity lens';
    confidence = 'high';
    evidence.push('High-distress affect or uncontained ending state');
  } else if (dream.mode === 'grounded' || /rushed|alienated|late|distraught|overload|anxious/.test(emotion) || /escalating|unresolved/.test(ending)) {
    primaryLens = 'Continuity / grounded lens';
    secondaryLens = dream.knownPersonName ? 'Known-person inner-figure lens' : 'Symbolic / depth lens';
    confidence = dream.reentry?.smallDetail || affectShift ? 'high' : 'medium';
    evidence.push('Dream stays close to waking strain, loss, lateness, or overload');
  } else {
    primaryLens = 'Symbolic / depth lens';
    secondaryLens = strangeReaction ? 'Affect-mismatch lens' : dream.knownPersonName ? 'Known-person inner-figure lens' : 'Continuity / grounded lens';
    confidence = strangeReaction || dream.reentry?.smallDetail ? 'high' : 'medium';
    evidence.push('Numinous imagery or anomalous affect without simple waking explanation');
  }

  if (dream.knownPersonName) evidence.push(`Known figure present: ${dream.knownPersonName}`);
  if (strangeReaction) evidence.push(`Re-entry anomaly: ${strangeReaction}`);
  if (affectShift) evidence.push(`Affect shift in replay: ${affectShift}`);
  if (dream.reentry?.smallDetail) evidence.push(`Small detail recovered: ${dream.reentry.smallDetail}`);

  return {
    primaryLens,
    secondaryLens,
    confidence,
    evidence,
  };
}

function followThroughDefaults(dream) {
  if (dream.mode === 'support') {
    return {
      microAction: 'Keep the strongest image and the prevailing emotion written down without forcing more interpretation this week.',
      signalToTrack: 'Track whether the body response softens, spikes, or repeats after sleep.',
    };
  }

  if (dream.mode === 'grounded') {
    return {
      microAction: 'Choose one practical situation where emotion is distorting organization and simplify it deliberately.',
      signalToTrack: 'Notice when hurry, lateness, or misplacing objects begins to carry relational strain.',
    };
  }

  return {
    microAction: 'Return to the small detail once this week and ask what attitude it may be correcting.',
    signalToTrack: 'Watch for moments where intensity is held at a distance rather than met directly.',
  };
}

export function deriveInterpretation(dream) {
  const defaults = followThroughDefaults(dream);
  const route = determineLensRoute(dream);

  if (dream.mode === 'support') {
    return {
      lens: route.primaryLens,
      secondaryLens: route.secondaryLens,
      routeConfidence: route.confidence,
      routeEvidence: route.evidence,
      routeReason: 'The dream is routed to containment because the prevailing emotion and ending state suggest the material may still be physiologically active.',
      headline: 'Containment before symbolic meaning.',
      observations: [
        `The dominant field is ${dream.prevailingEmotion.toLowerCase()}.`,
        `The ending remains ${dream.endingResolution.toLowerCase()}, which argues against pushing immediately into symbolic amplification.`,
        dream.reentry?.bodySensation
          ? `During replay the body response is ${dream.reentry.bodySensation.toLowerCase()}.`
          : 'There is not yet enough re-entry data to deepen interpretation safely.',
      ],
      hypotheses: [
        'The first task is to reduce activation and preserve the dream record rather than decide what it means.',
        knownFigureLine(dream),
        dream.reentry?.strangeReaction
          ? `The key unresolved anomaly is: ${dream.reentry.strangeReaction}.`
          : 'A later, narrower replay may clarify whether guilt, helplessness, grief, or shame is doing most of the work.',
      ],
      questions: [
        'What part of the dream still feels physically live right now?',
        'What would count as enough stabilization to revisit this dream more deeply?',
      ],
      microAction: dream.reentry?.integrationQuestion || defaults.microAction,
      signalToTrack: defaults.signalToTrack,
    };
  }

  if (dream.mode === 'grounded') {
    return {
      lens: route.primaryLens,
      secondaryLens: route.secondaryLens,
      routeConfidence: route.confidence,
      routeEvidence: route.evidence,
      routeReason: 'The dream is routed to grounded reading because it stays close to waking stress, attachment strain, overload, or practical disorganization.',
      headline: 'The dream turns emotional strain into practical pressure.',
      observations: [
        `The prevailing emotion is ${dream.prevailingEmotion.toLowerCase()}.`,
        `The ending remains ${dream.endingResolution.toLowerCase()}, which suggests the conflict is ongoing rather than resolved.`,
        dream.reentry?.affectShift
          ? `Replay makes the turning point clearer as ${dream.reentry.affectShift.toLowerCase()}.`
          : 'The emotional turning point likely needs one more slow replay.',
      ],
      hypotheses: [
        'The dream probably converts relational or attachment strain into hurry, disorganization, or loss of control.',
        knownFigureLine(dream),
        dream.reentry?.smallDetail
          ? `The small concrete carrier of pressure may be: ${dream.reentry.smallDetail}.`
          : 'A second pass may clarify which concrete object or moment carries the strain.',
      ],
      questions: [
        'What emotionally set the dream in motion before the logistical problem took over?',
        'Where in waking life is a practical scramble covering a more relational difficulty?',
      ],
      microAction: dream.reentry?.integrationQuestion || defaults.microAction,
      signalToTrack: defaults.signalToTrack,
    };
  }

  return {
    lens: route.primaryLens,
    secondaryLens: route.secondaryLens,
    routeConfidence: route.confidence,
    routeEvidence: route.evidence,
    routeReason: 'The dream is routed to symbolic depth because the imagery is numinous, emotionally disproportionate, or not well explained by day residue alone.',
    headline: 'The dream presents imagistic power before explanation.',
    observations: [
      `The emotional field is ${dream.prevailingEmotion.toLowerCase()}.`,
      `The ending remains ${dream.endingResolution.toLowerCase()}, which suggests containment rather than full resolution.`,
      dream.reentry?.strangeReaction
        ? `Replay reveals the anomalous feature as: ${dream.reentry.strangeReaction}.`
        : 'The emotionally strange feature likely needs further replay.',
    ],
    hypotheses: [
      'The dream may be compensating for a waking stance that is too controlled, distant, or literal.',
      knownFigureLine(dream),
      dream.reentry?.smallDetail
        ? `The minor detail worth following is: ${dream.reentry.smallDetail}.`
        : 'A small detail may carry more meaning than the obvious headline image.',
    ],
    questions: [
      'What in the dream feels powerful without yet being integrated?',
      'What waking attitude might this image be correcting or counterbalancing?',
    ],
    microAction: dream.reentry?.integrationQuestion || defaults.microAction,
    signalToTrack: defaults.signalToTrack,
  };
}

export function derivePatterns(dreams) {
  if (!dreams.length) {
    return {
      topEmotions: 'No data yet',
      commonEnding: 'No pattern yet',
      topKnownFigureTheme: 'No figure pattern yet',
      topReentryTheme: 'No re-entry pattern yet',
      followThroughRate: 'No follow-through yet',
      note: 'Once a few dreams are saved, the app can summarize recurring emotional fields, ending states, known-figure themes, re-entry shifts, and whether weekly follow-through is actually landing.',
    };
  }

  const emotionCounts = {};
  const endingCounts = {};
  const figureCounts = {};
  const reentryCounts = {};
  let completedFollowThrough = 0;

  dreams.forEach((dream) => {
    emotionCounts[dream.prevailingEmotion] = (emotionCounts[dream.prevailingEmotion] ?? 0) + 1;
    endingCounts[dream.endingResolution] = (endingCounts[dream.endingResolution] ?? 0) + 1;
    if (dream.knownPersonAsPart) {
      figureCounts[dream.knownPersonAsPart] = (figureCounts[dream.knownPersonAsPart] ?? 0) + 1;
    }
    if (dream.reentry?.strangeReaction) {
      reentryCounts[dream.reentry.strangeReaction] = (reentryCounts[dream.reentry.strangeReaction] ?? 0) + 1;
    }
    if (dream.followThrough?.checkInStatus === 'landed' || dream.followThrough?.checkInStatus === 'completed') {
      completedFollowThrough += 1;
    }
  });

  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => key)
    .join(' / ');

  const commonEnding = Object.entries(endingCounts).sort((a, b) => b[1] - a[1])[0][0];
  const topKnownFigureTheme = Object.keys(figureCounts).length
    ? Object.entries(figureCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'No figure pattern yet';
  const topReentryTheme = Object.keys(reentryCounts).length
    ? Object.entries(reentryCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'No re-entry pattern yet';
  const followThroughRate = `${completedFollowThrough}/${dreams.length} marked as landed or completed`;

  return {
    topEmotions,
    commonEnding,
    topKnownFigureTheme,
    topReentryTheme,
    followThroughRate,
    note: `Across ${dreams.length} saved dreams, endings most often resolve as “${commonEnding.toLowerCase()}”. The strongest recurring known-figure theme is: ${topKnownFigureTheme}. The strongest re-entry theme is: ${topReentryTheme}. Follow-through currently stands at ${followThroughRate}.`,
  };
}

export function deriveWeeklyReview(dreams) {
  if (!dreams.length) {
    return {
      needingReview: [],
      landingWell: [],
      unresolvedDreams: [],
      prompt: 'Save a few dreams first. Weekly review should highlight what still needs contact and what has already begun to land.',
    };
  }

  const needingReview = dreams
    .filter((dream) => !dream.followThrough || ['not-started', 'in-progress'].includes(dream.followThrough.checkInStatus))
    .slice(0, 3)
    .map((dream) => ({
      id: dream.id,
      title: dream.title,
      reason: dream.followThrough?.checkInStatus === 'in-progress'
        ? 'Follow-through has started but is not yet marked as landed.'
        : 'No weekly follow-through has been recorded yet.',
    }));

  const landingWell = dreams
    .filter((dream) => ['landed', 'completed'].includes(dream.followThrough?.checkInStatus))
    .slice(0, 3)
    .map((dream) => ({
      id: dream.id,
      title: dream.title,
      reason: dream.followThrough?.notes || 'Marked as landed or completed.',
    }));

  const unresolvedDreams = dreams
    .filter((dream) => /unresolved|escalating|uncontained|ambiguous/i.test(dream.endingResolution || ''))
    .slice(0, 3)
    .map((dream) => ({
      id: dream.id,
      title: dream.title,
      reason: `Ending remains ${dream.endingResolution.toLowerCase()}.`,
    }));

  return {
    needingReview,
    landingWell,
    unresolvedDreams,
    prompt: 'Weekly review should revisit dreams that remain unresolved, clarify which micro-actions actually landed, and surface the next dream that deserves deliberate attention.',
  };
}

export function buildExportBundle(dreams, patterns) {
  const sessionBrief = dreams
    .map((dream, index) => {
      const interpretation = deriveInterpretation(dream);
      return [
        `Dream ${index + 1}: ${dream.title}`,
        `Date: ${dream.createdAt}`,
        `Mode: ${dream.mode}`,
        `Prevailing emotion: ${dream.prevailingEmotion}`,
        `Ending state: ${dream.endingResolution}`,
        `Known figure: ${dream.knownPersonName || 'None recorded'}`,
        `Known figure as part: ${dream.knownPersonAsPart || 'None recorded'}`,
        `Tags: ${[...buildAutoTags(dream), ...(dream.tags || [])].join(', ') || 'None'}`,
        '',
        'Raw dream',
        dream.narrative,
        '',
        'Re-entry',
        `Scene replay: ${dream.reentry?.sceneReplay || 'Not captured'}`,
        `Body sensation: ${dream.reentry?.bodySensation || 'Not captured'}`,
        `Affect shift: ${dream.reentry?.affectShift || 'Not captured'}`,
        `Strange reaction: ${dream.reentry?.strangeReaction || 'Not captured'}`,
        `Small detail: ${dream.reentry?.smallDetail || 'Not captured'}`,
        '',
        'Interpretive working notes',
        `Lens: ${interpretation.lens}`,
        `Route reason: ${interpretation.routeReason}`,
        `Headline: ${interpretation.headline}`,
        `Observations: ${interpretation.observations.join(' | ')}`,
        `Hypotheses: ${interpretation.hypotheses.join(' | ')}`,
        `Questions: ${interpretation.questions.join(' | ')}`,
        '',
        'Follow-through',
        `Micro-action: ${dream.followThrough?.microAction || interpretation.microAction}`,
        `Signal to track: ${dream.followThrough?.signalToTrack || interpretation.signalToTrack}`,
        `Status: ${dream.followThrough?.checkInStatus || 'not-started'}`,
        `Check-in notes: ${dream.followThrough?.notes || 'None yet'}`,
      ].join('\n');
    })
    .join('\n\n----------------\n\n');

  const text = [
    'Dream Support Therapist Session Brief',
    '',
    `Selected dreams: ${dreams.length}`,
    `Pattern summary: ${patterns.note}`,
    `Top emotions: ${patterns.topEmotions}`,
    `Common ending: ${patterns.commonEnding}`,
    `Known-person theme: ${patterns.topKnownFigureTheme}`,
    `Re-entry theme: ${patterns.topReentryTheme}`,
    `Follow-through rate: ${patterns.followThroughRate}`,
    '',
    sessionBrief,
  ].join('\n');

  return {
    text,
    json: {
      generatedAt: new Date().toISOString(),
      patterns,
      dreams: dreams.map((dream) => ({
        ...dream,
        autoTags: buildAutoTags(dream),
        interpretation: deriveInterpretation(dream),
      })),
    },
  };
}
