import { NextResponse } from 'next/server';
import { deriveInterpretation } from '../../../lib/lens-engine';
import { analysisJsonSchema } from '../../../lib/analysis-schema';
import { buildDreamAnalysisInput, buildDreamAnalysisInstructions } from '../../../lib/prompt-modules';

export const runtime = 'nodejs';

function extractResponseText(payload) {
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

function buildFallbackAnalysis(dream, reason) {
  const local = deriveInterpretation(dream);
  return {
    source: 'local-fallback',
    fallbackReason: reason,
    debug: {
      hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
      hasOpenAiModel: Boolean(process.env.OPENAI_MODEL),
      vercelEnv: process.env.VERCEL_ENV || 'unknown',
      vercelUrl: process.env.VERCEL_URL || 'unknown',
    },
    primaryLens: local.lens,
    secondaryLens: local.secondaryLens || 'Known-person inner-figure lens',
    confidence: local.routeConfidence || 'medium',
    routeReason: local.routeReason,
    routeEvidence: local.routeEvidence || [],
    headline: local.headline,
    atmosphere: dream.prevailingEmotion,
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

async function requestStructuredAnalysis(apiKey, dream) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
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
  const text = extractResponseText(payload);
  if (!text) throw new Error('Structured output returned no text.');
  return JSON.parse(text);
}

async function requestJsonModeAnalysis(apiKey, dream) {
  const schemaKeys = Object.keys(analysisJsonSchema.schema.properties).join(', ');
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
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
  const text = extractResponseText(payload);
  if (!text) throw new Error('JSON mode returned no text.');
  return JSON.parse(text);
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ analysis: buildFallbackAnalysis(dream, 'OPENAI_API_KEY is not configured.') });
  }

  try {
    let analysis;
    let sourceMode = 'openai-structured';
    try {
      analysis = await requestStructuredAnalysis(apiKey, dream);
    } catch (structuredError) {
      try {
        analysis = await requestJsonModeAnalysis(apiKey, dream);
        sourceMode = 'openai-json-mode';
      } catch (jsonModeError) {
        const combinedReason = [
          structuredError instanceof Error ? structuredError.message : 'Structured output failed.',
          jsonModeError instanceof Error ? jsonModeError.message : 'JSON mode failed.',
        ].join(' | ');
        return NextResponse.json({ analysis: buildFallbackAnalysis(dream, combinedReason) });
      }
    }

    return NextResponse.json({
      analysis: {
        source: sourceMode,
        ...analysis,
      },
    });
  } catch (error) {
    return NextResponse.json({
      analysis: buildFallbackAnalysis(dream, error instanceof Error ? error.message : 'Unknown analysis error.'),
    });
  }
}
