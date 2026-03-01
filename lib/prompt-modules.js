import { deriveInterpretation } from './lens-engine';

function summarizeKnownFigure(dream) {
  if (!dream.knownPersonName) return 'No central known person identified.';
  return `${dream.knownPersonName} (${dream.knownPersonRelationship || 'known figure'}) is associated with: ${dream.knownPersonAssociations || 'not specified'}. If treated as part of the dreamer, this figure may represent: ${dream.knownPersonAsPart || 'not specified'}.`;
}

export function buildDreamAnalysisInstructions() {
  return [
    'You are analyzing a dream for a private-first dream support application.',
    'Your job is to produce a nuanced, non-dogmatic reading grounded in the structured dream data.',
    'Do not act like a dream dictionary. Personal context, prevailing emotion, the ending state, re-entry details, and known-person inner-figure reflection matter more than generic symbol labels.',
    'Use these method constraints drawn from the app methodology:',
    '- Marie-Louise von Franz / Jungian depth: treat small details, compensation, and emotionally strange reactions as important evidence.',
    '- Hillman imaginal caution: do not flatten the dream too quickly into waking-life utility; preserve atmosphere and dream-world logic where relevant.',
    '- Grounded continuity reading: for stress/attachment/logistics dreams, distinguish the emotional trigger from the practical problem that organizes the dream.',
    '- Support-first handling: if the dream is still highly distressing or uncontained, prioritize stabilization and containment before symbolic amplification.',
    '- Known people should first be explored as inner figures representing qualities or parts of the dreamer before any literal reading.',
    'Return a careful analysis with multiple hypotheses, not a verdict.',
    'Every hypothesis should be tied to specific evidence from the dream record.',
    'Avoid diagnosis, certainty, and any claim that the dream definitively predicts or proves something.',
    'Be concise but substantive.',
  ].join('\n');
}

export function buildDreamAnalysisInput(dream) {
  const local = deriveInterpretation(dream);
  return [
    'Analyze this dream record.',
    '',
    `Mode hint: ${dream.mode}`,
    `Title: ${dream.title}`,
    `Prevailing emotion: ${dream.prevailingEmotion}`,
    `Ending: ${dream.ending}`,
    `Ending state: ${dream.endingResolution}`,
    `Narrative: ${dream.narrative}`,
    '',
    `Known figure note: ${summarizeKnownFigure(dream)}`,
    '',
    'Re-entry notes:',
    `- Scene replay: ${dream.reentry?.sceneReplay || 'Not captured'}`,
    `- Body sensation: ${dream.reentry?.bodySensation || 'Not captured'}`,
    `- Affect shift: ${dream.reentry?.affectShift || 'Not captured'}`,
    `- Strange reaction: ${dream.reentry?.strangeReaction || 'Not captured'}`,
    `- Small detail: ${dream.reentry?.smallDetail || 'Not captured'}`,
    '',
    'Local scaffold already derived by the app:',
    `- Primary lens: ${local.lens}`,
    `- Secondary lens: ${local.secondaryLens || 'None'}`,
    `- Route reason: ${local.routeReason}`,
    `- Route confidence: ${local.routeConfidence || 'medium'}`,
    `- Route evidence: ${(local.routeEvidence || []).join(' | ') || 'None'}`,
    `- Headline: ${local.headline}`,
    '',
    'Use that scaffold as context, but improve on it where warranted by the evidence.',
  ].join('\n');
}
