import type { Token, TokenType, ColorMap } from '../types/latex';
import { TOKEN_COLORS } from '../types/latex';

let tokenIdCounter = 0;

export function generateTokenId(): string {
  return `token-${++tokenIdCounter}`;
}

export function resetTokenIdCounter(): void {
  tokenIdCounter = 0;
}

export function getColorForType(type: TokenType): string {
  return TOKEN_COLORS[type] || TOKEN_COLORS.operator;
}

export function assignColorsToTokens(tokens: Token[], colorMap: ColorMap = {}): ColorMap {
  const updatedColorMap = { ...colorMap };

  for (const token of tokens) {
    if (token.type === 'result_var' || token.type === 'input_var' || token.type === 'index_var') {
      const varName = extractVariableName(token.value);
      if (!updatedColorMap[varName]) {
        updatedColorMap[varName] = token.color;
      }
    }

    if (token.children) {
      assignColorsToTokens(token.children, updatedColorMap);
    }
  }

  return updatedColorMap;
}

function extractVariableName(value: string): string {
  return value.replace(/[_^{}\\]/g, '').trim();
}

export function colorizeLatex(latex: string, tokens: Token[]): string {
  let result = latex;

  const sortedTokens = [...tokens].sort((a, b) => b.rawLatex.length - a.rawLatex.length);

  for (const token of sortedTokens) {
    if (token.rawLatex && token.color) {
      const coloredLatex = `\\textcolor{${token.color}}{${token.rawLatex}}`;
      result = result.replace(token.rawLatex, coloredLatex);
    }
  }

  return result;
}

export function buildColorizedLatex(tokens: Token[]): string {
  return tokens.map(token => {
    if (token.children && token.children.length > 0) {
      return wrapWithColor(reconstructLatex(token), token.color);
    }
    return wrapWithColor(token.rawLatex, token.color);
  }).join(' ');
}

function wrapWithColor(latex: string, color: string): string {
  if (!latex || !color) return latex;
  return `{\\color{${color}}${latex}}`;
}

function reconstructLatex(token: Token): string {
  switch (token.type) {
    case 'fraction':
      return token.rawLatex;
    case 'summation':
    case 'product':
    case 'integral':
      return token.rawLatex;
    default:
      return token.rawLatex;
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
