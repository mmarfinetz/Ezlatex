import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ModelProvider = 'claude' | 'gpt5';

const DEFAULT_MODEL: ModelProvider = (process.env.DEFAULT_MODEL as ModelProvider) || 'claude';

interface Token {
  id: string;
  type: string;
  value: string;
  rawLatex: string;
  color: string;
}

interface ExplainRequest {
  latex: string;
  tokens: Token[];
  model?: ModelProvider;
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
  detailLevel?: 'brief' | 'detailed';
}

type DetailLevel = 'brief' | 'detailed';

function buildPrompt(
  latex: string,
  tokens: Token[],
  detailLevel: DetailLevel = 'brief'
): string {
  const uniqueColors = new Map<string, Token>();
  tokens
    .filter(t => t.type !== 'operator' && t.type !== 'group')
    .forEach(t => {
      if (!uniqueColors.has(t.color)) {
        uniqueColors.set(t.color, t);
      }
    });

  const tokenDescriptions = Array.from(uniqueColors.values())
    .map(t => `- "${t.value}" (${t.type}): ${t.color}`)
    .join('\n');

  const colorList = Array.from(uniqueColors.keys()).join(', ');

  const sharedIntro = `You are explaining math to someone who thinks visually. Here's a LaTeX equation with its components identified:

Equation: ${latex}

Components (each has a unique color):
${tokenDescriptions}

The "type" hint describes the role of each component (result_var = final quantity, input_var = inputs, index_var = position/time/frequency index, summation = add many contributions, exponent = power/rotation, bounds = limits on a sum or integral, etc.). Use these roles to ground your explanation in how the equation behaves.`;

  if (detailLevel === 'detailed') {
    return `${sharedIntro}

Write a two-part, HTML-formatted explanation of what this equation DOES.

PART 1 – Big-picture summary
- 1–2 sentences (30–70 words) explaining the overall process: what goes in, how it is transformed, and what the final result means.
- Weave in the most important components using colored spans.

PART 2 – Color-by-color breakdown
- After a blank line (use "<br/><br/>"), add the heading: "Color-by-color breakdown:".
- Then, for EVERY component listed above, write a separate bullet on its own line.
- Each bullet must start with "• " followed by a <span style="color:{hex};font-weight:600">short phrase for that component</span>, then plain English describing its role in the equation.

STRICT COLOR RULES:
1. You MUST use ALL of these colors in your explanation: ${colorList}
2. Every component in the Components list must be mentioned at least once in PART 2.
3. Whenever you refer to a component, wrap the key phrase for it in a <span style="color:{hex};font-weight:600">...</span> tag using its EXACT hex color.
4. Do NOT invent any new colors or components that are not in the Components list.

STYLE:
- Use analogies and intuitive language; avoid heavy jargon.
- Assume a smart reader who knows high-school math but not advanced math.

Return ONLY the HTML-formatted text for both parts, nothing else.`;
  }

  return `${sharedIntro}

Write a single flowing explanation of what this equation DOES (not what it IS).

CRITICAL REQUIREMENTS:
1. You MUST use ALL of these colors in your explanation: ${colorList}
2. Every colored component from the equation must be explicitly referenced with its matching color at least once
3. Use <span style="color:{hex};font-weight:600">phrase</span> tags with the EXACT hex colors listed above
4. Use analogies and intuitive language, avoid jargon
5. Keep it between 40 and 80 words

Example format for a quadratic formula:
"To find <span style="color:#14b8a6;font-weight:600">where a curve crosses zero</span>, take <span style="color:#f97316;font-weight:600">the negative middle coefficient</span>, add or subtract <span style="color:#3b82f6;font-weight:600">the square root of the discriminant</span>, then <span style="color:#06b6d4;font-weight:600">divide by twice the leading coefficient</span>."

Now write the explanation. Return ONLY the HTML-formatted text, nothing else.`;
}

async function generateWithClaude(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }
  return content.text.trim();
}

async function generateWithGPT5(
  prompt: string,
  reasoningEffort: 'minimal' | 'low' | 'medium' | 'high' = 'medium'
): Promise<{ text: string; reasoning?: string }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-5',
    max_completion_tokens: 1000,
    reasoning_effort: reasoningEffort,
    messages: [{ role: 'user', content: prompt }],
  } as any);

  const choice = response.choices[0];
  const text = choice.message?.content?.trim() || '';

  // Extract reasoning if available (GPT-5 returns it in the response)
  const reasoning = (choice.message as any)?.reasoning?.trim();

  return { text, reasoning };
}

async function handleExplain(
  req: express.Request,
  res: express.Response
) {
  try {
    const { latex, tokens, model, reasoningEffort, detailLevel } = req.body as ExplainRequest;

    if (!latex || !tokens) {
      return res.status(400).json({ error: 'Missing latex or tokens' });
    }

    const selectedModel = model || DEFAULT_MODEL;
    const prompt = buildPrompt(latex, tokens, detailLevel || 'brief');
    let html: string;
    let reasoning: string | undefined;

    if (selectedModel === 'gpt5') {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }
      const result = await generateWithGPT5(prompt, reasoningEffort || 'medium');
      html = result.text;
      reasoning = result.reasoning;
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: 'Anthropic API key not configured' });
      }
      html = await generateWithClaude(prompt);
    }

    const plainText = html.replace(/<[^>]*>/g, '');

    res.json({
      explanation: {
        html,
        plainText,
        reasoning,
      },
      model: selectedModel,
    });
  } catch (error) {
    console.error('Error generating explanation:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate explanation',
    });
  }
}

app.post('/api/explain', handleExplain);
app.post('/explain', handleExplain);

async function handleExplainStream(
  req: express.Request,
  res: express.Response
) {
  try {
    const { latex, tokens, detailLevel } = req.body as ExplainRequest;

    if (!latex || !tokens) {
      return res.status(400).json({ error: 'Missing latex or tokens' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const prompt = buildPrompt(latex, tokens, detailLevel || 'brief');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }

    res.end();
  } catch (error) {
    console.error('Error streaming explanation:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to stream explanation',
    });
  }
}

app.post('/api/explain/stream', handleExplainStream);
app.post('/explain/stream', handleExplainStream);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    models: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      gpt5: !!process.env.OPENAI_API_KEY,
    },
    defaultModel: DEFAULT_MODEL,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Claude API key: ${!!process.env.ANTHROPIC_API_KEY}`);
  console.log(`OpenAI API key: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`Default model: ${DEFAULT_MODEL}`);
});
