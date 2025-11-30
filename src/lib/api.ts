import type { Token, Explanation } from '../types/latex';

const API_BASE = '/api';

export interface ExplainRequest {
  latex: string;
  tokens: Token[];
  detailLevel?: 'brief' | 'detailed';
}

export interface ExplainResponse {
  explanation: Explanation;
}

export async function generateExplanation(
  latex: string,
  tokens: Token[],
  detailLevel: 'brief' | 'detailed' = 'brief'
): Promise<Explanation> {
  const response = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ latex, tokens, detailLevel }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate explanation: ${error}`);
  }

  const data: ExplainResponse = await response.json();
  return data.explanation;
}

export async function streamExplanation(
  latex: string,
  tokens: Token[],
  detailLevel: 'brief' | 'detailed' = 'brief',
  onChunk: (chunk: string) => void
): Promise<Explanation> {
  const response = await fetch(`${API_BASE}/explain/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ latex, tokens, detailLevel }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate explanation: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    fullText += chunk;
    onChunk(chunk);
  }

  return {
    html: fullText,
    plainText: fullText.replace(/<[^>]*>/g, ''),
  };
}
