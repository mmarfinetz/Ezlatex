import type { Token, TokenType, ParsedEquation, ColorMap } from '../types/latex';
import { TOKEN_COLORS } from '../types/latex';
import { generateTokenId, resetTokenIdCounter } from './colorMapper';

const GREEK_LETTERS = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
  'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho',
  'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho',
  'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
];

const FUNCTIONS = [
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh',
  'log', 'ln', 'exp', 'det', 'dim', 'ker', 'deg',
  'max', 'min', 'sup', 'inf', 'lim', 'arg',
];

class LatexParser {
  private input: string;
  private pos: number;
  private tokens: Token[];
  private variableMap: Map<string, TokenType>;
  private colorMap: ColorMap;
  private isLHS: boolean;

  constructor(latex: string) {
    this.input = latex.trim();
    this.pos = 0;
    this.tokens = [];
    this.variableMap = new Map();
    this.colorMap = {};
    this.isLHS = true;
  }

  parse(): ParsedEquation {
    resetTokenIdCounter();
    this.tokens = this.parseExpression();

    return {
      tokens: this.tokens,
      colorMap: this.colorMap,
      colorizedLatex: this.buildColorizedOutput(),
      originalLatex: this.input,
    };
  }

  private buildColorizedOutput(): string {
    return this.colorizeRecursive(this.tokens);
  }

  private colorizeRecursive(tokens: Token[]): string {
    return tokens.map(token => {
      let inner = token.rawLatex;

      if (token.children && token.children.length > 0) {
        inner = this.colorizeRecursive(token.children);
      }

      if (token.color && token.color !== TOKEN_COLORS.operator) {
        return `{\\color{${token.color}}${inner}}`;
      }
      return inner;
    }).join('');
  }

  private parseExpression(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const char = this.input[this.pos];

      if (char === '=') {
        tokens.push(this.createToken('operator', '=', '='));
        this.pos++;
        this.isLHS = false;
        continue;
      }

      if (char === '\\') {
        const command = this.parseCommand();
        if (command) tokens.push(command);
        continue;
      }

      if (char === '{') {
        const group = this.parseGroup();
        if (group) tokens.push(group);
        continue;
      }

      if (char === '}') {
        break;
      }

      if (char === '^') {
        this.pos++;
        const exp = this.parseSuperscript();
        if (exp) tokens.push(exp);
        continue;
      }

      if (char === '_') {
        this.pos++;
        const sub = this.parseSubscript();
        if (sub) tokens.push(sub);
        continue;
      }

      if (this.isOperator(char)) {
        tokens.push(this.createToken('operator', char, char));
        this.pos++;
        continue;
      }

      if (this.isDigit(char)) {
        const num = this.parseNumber();
        tokens.push(this.createToken('constant', num, num));
        continue;
      }

      if (this.isLetter(char)) {
        const variable = this.parseVariable();
        if (variable) tokens.push(variable);
        continue;
      }

      this.pos++;
    }

    return tokens;
  }

  private parseCommand(): Token | null {
    this.pos++;

    let cmdName = '';
    while (this.pos < this.input.length && this.isLetter(this.input[this.pos])) {
      cmdName += this.input[this.pos];
      this.pos++;
    }

    if (!cmdName) {
      const char = this.input[this.pos];
      if (char) {
        this.pos++;
        return this.createToken('operator', '\\' + char, '\\' + char);
      }
      return null;
    }

    if (cmdName === 'frac') {
      return this.parseFraction();
    }

    if (cmdName === 'sqrt') {
      return this.parseSqrt();
    }

    if (cmdName === 'sum') {
      return this.parseBigOperator('summation');
    }

    if (cmdName === 'prod') {
      return this.parseBigOperator('product');
    }

    if (cmdName === 'int') {
      return this.parseBigOperator('integral');
    }

    if (cmdName === 'lim') {
      return this.parseLimit();
    }

    if (cmdName === 'binom') {
      return this.parseBinom();
    }

    if (GREEK_LETTERS.includes(cmdName)) {
      const rawLatex = '\\' + cmdName;
      const type = this.classifyVariable(cmdName);
      const color = TOKEN_COLORS[type];
      this.colorMap[cmdName] = color;
      return this.createToken(type, cmdName, rawLatex, color);
    }

    if (FUNCTIONS.includes(cmdName)) {
      return this.createToken('function', cmdName, '\\' + cmdName, TOKEN_COLORS.function);
    }

    if (cmdName === 'cdot' || cmdName === 'times' || cmdName === 'div') {
      return this.createToken('operator', cmdName, '\\' + cmdName);
    }

    if (cmdName === 'pm' || cmdName === 'mp') {
      return this.createToken('operator', cmdName, '\\' + cmdName);
    }

    if (cmdName === 'to' || cmdName === 'rightarrow' || cmdName === 'leftarrow') {
      return this.createToken('operator', cmdName, '\\' + cmdName);
    }

    if (cmdName === 'infty') {
      return this.createToken('constant', '∞', '\\infty', TOKEN_COLORS.bounds);
    }

    if (cmdName === 'partial') {
      return this.createToken('operator', '∂', '\\partial');
    }

    if (cmdName === 'hbar') {
      return this.createToken('constant', 'ℏ', '\\hbar', TOKEN_COLORS.constant);
    }

    if (cmdName === 'hat') {
      this.skipWhitespace();
      if (this.input[this.pos] === '{') {
        this.pos++;
        const inner = this.parseUntilClosingBrace();
        return this.createToken('operator', `\\hat{${inner}}`, `\\hat{${inner}}`);
      }
    }

    if (cmdName === 'log' || cmdName === 'ln') {
      let rawLatex = '\\' + cmdName;
      if (this.input[this.pos] === '_') {
        this.pos++;
        const base = this.parseSingleTokenOrGroup();
        rawLatex += '_' + base;
      }
      return this.createToken('function', cmdName, rawLatex, TOKEN_COLORS.function);
    }

    return this.createToken('operator', cmdName, '\\' + cmdName);
  }

  private parseFraction(): Token {
    this.skipWhitespace();

    const numerator = this.parseSingleTokenOrGroup();
    this.skipWhitespace();
    const denominator = this.parseSingleTokenOrGroup();

    const rawLatex = `\\frac{${numerator}}{${denominator}}`;
    const token = this.createToken('fraction', 'fraction', rawLatex, TOKEN_COLORS.fraction);

    token.children = [
      ...this.parseSubExpression(numerator),
      ...this.parseSubExpression(denominator),
    ];

    return token;
  }

  private parseSqrt(): Token {
    this.skipWhitespace();

    let nthRoot = '';
    if (this.input[this.pos] === '[') {
      this.pos++;
      while (this.pos < this.input.length && this.input[this.pos] !== ']') {
        nthRoot += this.input[this.pos];
        this.pos++;
      }
      this.pos++;
    }

    const content = this.parseSingleTokenOrGroup();
    const rawLatex = nthRoot ? `\\sqrt[${nthRoot}]{${content}}` : `\\sqrt{${content}}`;

    const token = this.createToken('sqrt', 'sqrt', rawLatex, TOKEN_COLORS.sqrt);
    token.children = this.parseSubExpression(content);

    return token;
  }

  private parseBigOperator(type: 'summation' | 'product' | 'integral'): Token {
    let rawLatex = type === 'summation' ? '\\sum' : type === 'product' ? '\\prod' : '\\int';
    const bounds: { lower?: string; upper?: string } = {};

    this.skipWhitespace();

    if (this.input[this.pos] === '_') {
      this.pos++;
      bounds.lower = this.parseSingleTokenOrGroup();
      rawLatex += `_{${bounds.lower}}`;
    }

    this.skipWhitespace();

    if (this.input[this.pos] === '^') {
      this.pos++;
      bounds.upper = this.parseSingleTokenOrGroup();
      rawLatex += `^{${bounds.upper}}`;
    }

    const token = this.createToken(type, type, rawLatex, TOKEN_COLORS[type]);
    token.bounds = bounds;

    if (bounds.lower) {
      const lowerTokens = this.parseSubExpression(bounds.lower);
      for (const t of lowerTokens) {
        if (t.type === 'input_var' || t.type === 'result_var') {
          t.type = 'index_var';
          t.color = TOKEN_COLORS.index_var;
          this.colorMap[t.value] = t.color;
        }
      }
    }

    return token;
  }

  private parseLimit(): Token {
    let rawLatex = '\\lim';
    let bounds: { lower?: string } = {};

    this.skipWhitespace();

    if (this.input[this.pos] === '_') {
      this.pos++;
      bounds.lower = this.parseSingleTokenOrGroup();
      rawLatex += `_{${bounds.lower}}`;
    }

    const token = this.createToken('limit', 'lim', rawLatex, TOKEN_COLORS.limit);
    token.bounds = bounds;

    return token;
  }

  private parseBinom(): Token {
    this.skipWhitespace();

    const n = this.parseSingleTokenOrGroup();
    this.skipWhitespace();
    const k = this.parseSingleTokenOrGroup();

    const rawLatex = `\\binom{${n}}{${k}}`;
    const token = this.createToken('function', 'binom', rawLatex, TOKEN_COLORS.function);

    token.children = [
      ...this.parseSubExpression(n),
      ...this.parseSubExpression(k),
    ];

    return token;
  }

  private parseSuperscript(): Token {
    const content = this.parseSingleTokenOrGroup();
    const rawLatex = `^{${content}}`;

    const token = this.createToken('exponent', 'exponent', rawLatex, TOKEN_COLORS.exponent);
    token.children = this.parseSubExpression(content);

    return token;
  }

  private parseSubscript(): Token {
    const content = this.parseSingleTokenOrGroup();
    const rawLatex = `_{${content}}`;

    const token = this.createToken('subscript', 'subscript', rawLatex, TOKEN_COLORS.subscript);
    token.children = this.parseSubExpression(content);

    return token;
  }

  private parseGroup(): Token | null {
    this.pos++;
    const content = this.parseUntilClosingBrace();

    if (!content.trim()) return null;

    const tokens = this.parseSubExpression(content);

    if (tokens.length === 1) {
      return tokens[0];
    }

    const token = this.createToken('group', 'group', `{${content}}`);
    token.children = tokens;
    return token;
  }

  private parseVariable(): Token {
    let varName = this.input[this.pos];
    this.pos++;

    let rawLatex = varName;

    this.skipWhitespace();
    if (this.input[this.pos] === '_') {
      this.pos++;
      const sub = this.parseSingleTokenOrGroup();
      rawLatex += `_{${sub}}`;
      varName += '_' + sub;
    }

    if (this.input[this.pos] === '^') {
      this.pos++;
      const sup = this.parseSingleTokenOrGroup();
      rawLatex += `^{${sup}}`;
    }

    const type = this.classifyVariable(varName);
    const color = this.getOrAssignColor(varName, type);

    return this.createToken(type, varName, rawLatex, color);
  }

  private parseNumber(): string {
    let num = '';
    while (this.pos < this.input.length && (this.isDigit(this.input[this.pos]) || this.input[this.pos] === '.')) {
      num += this.input[this.pos];
      this.pos++;
    }
    return num;
  }

  private parseSingleTokenOrGroup(): string {
    this.skipWhitespace();

    if (this.input[this.pos] === '{') {
      this.pos++;
      return this.parseUntilClosingBrace();
    }

    if (this.input[this.pos] === '\\') {
      const start = this.pos;
      this.pos++;
      let cmd = '';
      while (this.pos < this.input.length && this.isLetter(this.input[this.pos])) {
        cmd += this.input[this.pos];
        this.pos++;
      }
      return this.input.slice(start, this.pos);
    }

    const char = this.input[this.pos];
    this.pos++;
    return char || '';
  }

  private parseUntilClosingBrace(): string {
    let depth = 1;
    let content = '';

    while (this.pos < this.input.length && depth > 0) {
      const char = this.input[this.pos];
      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0) {
          this.pos++;
          break;
        }
      }
      content += char;
      this.pos++;
    }

    return content;
  }

  private parseSubExpression(latex: string): Token[] {
    const subParser = new LatexParser(latex);
    subParser.isLHS = this.isLHS;
    subParser.variableMap = this.variableMap;
    subParser.colorMap = this.colorMap;

    const result = subParser.parse();

    this.variableMap = subParser.variableMap;
    this.colorMap = subParser.colorMap;

    return result.tokens;
  }

  private classifyVariable(name: string): TokenType {
    const baseName = name.split('_')[0].replace(/[\\{}]/g, '');

    if (this.variableMap.has(baseName)) {
      return this.variableMap.get(baseName)!;
    }

    let type: TokenType;

    if (this.isLHS) {
      type = 'result_var';
    } else if (['i', 'j', 'k', 'n', 'm'].includes(baseName.toLowerCase())) {
      type = 'index_var';
    } else {
      type = 'input_var';
    }

    this.variableMap.set(baseName, type);
    return type;
  }

  private getOrAssignColor(name: string, type: TokenType): string {
    const baseName = name.split('_')[0].replace(/[\\{}]/g, '');

    if (this.colorMap[baseName]) {
      return this.colorMap[baseName];
    }

    const color = TOKEN_COLORS[type];
    this.colorMap[baseName] = color;
    return color;
  }

  private createToken(type: TokenType, value: string, rawLatex: string, color?: string): Token {
    return {
      id: generateTokenId(),
      type,
      value,
      rawLatex,
      color: color || TOKEN_COLORS[type],
    };
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private isLetter(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isOperator(char: string): boolean {
    return ['+', '-', '*', '/', '(', ')', '[', ']', ',', '!', '|', '<', '>'].includes(char);
  }
}

export function parseLatex(latex: string): ParsedEquation {
  const parser = new LatexParser(latex);
  return parser.parse();
}

export function validateLatex(latex: string): { valid: boolean; error?: string } {
  try {
    let braceCount = 0;
    let bracketCount = 0;

    for (const char of latex) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;

      if (braceCount < 0 || bracketCount < 0) {
        return { valid: false, error: 'Mismatched brackets or braces' };
      }
    }

    if (braceCount !== 0) {
      return { valid: false, error: 'Unclosed braces' };
    }

    if (bracketCount !== 0) {
      return { valid: false, error: 'Unclosed brackets' };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}
