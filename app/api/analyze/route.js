import { NextResponse } from 'next/server';
import { deriveInterpretation } from '../../../lib/lens-engine';
import { analysisJsonSchema } from '../../../lib/analysis-schema';
import { buildDreamAnalysisInput, buildDreamAnalysisInstructions } from '../../../lib/prompt-modules';

export const runtime = 'nodejs';

function extractOpenAiResponseText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text) return payload.output_text;

  const texts = [];
  for (const item of payload.output || []) {
    if (item.type === 'message') {
      for (const content of item.content || []) {
        if (content.type === 'output_text' && content.text) texts.push(content.text);
        if (content.type === 'text' && content.text) texts.push(content.text);
      }
    }
  }
  return texts.join('\n').trim();
}

function extractClaudeResponseText(payload) {
  const texts = [];
  for (const block of payload.content || []) {
    if (block.type === 'text' && block.text) texts.push(block.text);
  }
  return texts.join('\n').trim();
}

function parseJsonFromText(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}

  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  try {
    return JSON.parse(unfenced);
  } catch {}

  const firstBrace = unfenced.indexOf('{');
  const lastBrace = unfenced.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = unfenced.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  throw new Error(`Response was not valid JSON. First 180 chars: ${trimmed.slice(0, 180)}`);
}

function buildFallbackAnalysis(dream, reason, provider = 'openai') {
  const local = deriveInterpretation(dream);
  return {
    source: 'local-fallback',
    provider,
    fallbackReason: reason,
    primaryLens: local.lens,
    secondaryLens: local.secondaryLens || 'Known-person inner-figure lens',
    confidence: local.routeConfidence || 'medium',
    routeReason: local.routeReason,
    routeEvidence: local.routeEvidence || [],
    headline: local.headline,
    atmosphere: dream.prevailingEmotion,
    governingField: `The dream is organized around ${dream.prevailingEmotion || 'an emotionally charged field'} rather than around symbol labels alone.`,
    decisiveTurn: dream.reentry?.affectShift || 'The dream’s key turn should be clarified through slower replay.',
    endingReading: `The ending reads as ${dream.endingResolution || 'still unresolved'}, which suggests the process remains active.`,
    reading: [
      local.headline,
      `The prevailing emotion appears to be ${dream.prevailingEmotion || 'emotionally mixed'}, and the ending reads as ${dream.endingResolution || 'still open'}.`,
      'Treat this as a working scaffold rather than a final interpretation.',
    ].join(' '),
    observations: local.observations,
    hypotheses: local.hypotheses,
    disconfirmingCues: [
      'Check whether the reading fits the dreamer’s lived context rather than sounding merely plausible.',
      'Revise the reading if later re-entry data changes the emotional center of the dream.',
    ],
    questionsToHold: local.questions,
    microAction: local.microAction,
    signalToTrack: local.signalToTrack,
    humilityNote: 'Treat this as a working lens, not a verdict.',
  };
}

async function requestOpenAiStructuredAnalysis(apiKey, dream, model) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: buildDreamAnalysisInstructions() }] },
        { role: 'user', content: [{ type: 'input_text', text: buildDreamAnalysisInput(dream) }] },
      ],
      text: {
        format: {
          type: 'json_schema',
          ...analysisJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Structured output request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const text = extractOpenAiResponseText(payload);
  if (!text) throw new Error('Structured output returned no text.');
  return parseJsonFromText(text);
}

async function requestOpenAiJsonModeAnalysis(apiKey, dream, model) {
  const schemaKeys = Object.keys(analysisJsonSchema.schema.properties).join(', ');
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: `${buildDreamAnalysisInstructions()}\nReturn valid JSON only. Use exactly these top-level keys: ${schemaKeys}.`,
            },
          ],
        },
        { role: 'user', content: [{ type: 'input_text', text: buildDreamAnalysisInput(dream) }] },
      ],
      text: {
        format: {
          type: 'json_object',
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`JSON mode request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const text = extractOpenAiResponseText(payload);
  if (!text) throw new Error('JSON mode returned no text.');
  return parseJsonFromText(text);
}

async function requestClaudeAnalysis(apiKey, dream, model) {
  const schemaKeys = Object.keys(analysisJsonSchema.schema.properties).join(', ');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      system: `${buildDreamAnalysisInstructions()}\nReturn valid JSON only. Use exactly these top-level keys: ${schemaKeys}.`,
      messages: [
        {
          role: 'user',
          content: buildDreamAnalysisInput(dream),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const text = extractClaudeResponseText(payload);
  if (!text) throw new Error('Claude returned no text.');
  return parseJsonFromText(text);
}

function getProviderConfig(requestedProvider) {
  const provider = requestedProvider === 'claude' ? 'claude' : 'openai';

  if (provider === 'claude') {
    return {
      provider,
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    };
  }

  return {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const dream = body?.dream;
  if (!dream || !dream.title || !dream.narrative) {
    return NextResponse.json({ error: 'Dream payload is required.' }, { status: 400 });
  }

  const providerConfig = getProviderConfig(body?.provider);
  if (!providerConfig.apiKey) {
    const missingName = providerConfig.provider === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
    return NextResponse.json({ analysis: buildFallbackAnalysis(dream, `${missingName} is not configured.`, providerConfig.provider) });
  }

  try {
    if (providerConfig.provider === 'claude') {
      const analysis = await requestClaudeAnalysis(providerConfig.apiKey, dream, providerConfig.model);
      return NextResponse.json({
        analysis: {
          source: 'claude-json',
          provider: 'claude',
          ...analysis,
        },
      });
    }

    let analysis;
    let sourceMode = 'openai-structured';
    try {
      analysis = await requestOpenAiStructuredAnalysis(providerConfig.apiKey, dream, providerConfig.model);
    } catch (structuredError) {
      try {
        analysis = await requestOpenAiJsonModeAnalysis(providerConfig.apiKey, dream, providerConfig.model);
        sourceMode = 'openai-json-mode';
      } catch (jsonModeError) {
        const combinedReason = [
          structuredError instanceof Error ? structuredError.message : 'Structured output failed.',
          jsonModeError instanceof Error ? jsonModeError.message : 'JSON mode failed.',
        ].join(' | ');
        return NextResponse.json({ analysis: buildFallbackAnalysis(dream, combinedReason, 'openai') });
      }
    }

    return NextResponse.json({
      analysis: {
        source: sourceMode,
        provider: 'openai',
        ...analysis,
      },
    });
  } catch (error) {
    return NextResponse.json({
      analysis: buildFallbackAnalysis(
        dream,
        error instanceof Error ? error.message : 'Unknown analysis error.',
        providerConfig.provider,
      ),
    });
  }
}
