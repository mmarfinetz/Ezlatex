export type TokenType =
  | 'result_var'
  | 'input_var'
  | 'index_var'
  | 'summation'
  | 'product'
  | 'integral'
  | 'limit'
  | 'fraction'
  | 'exponent'
  | 'subscript'
  | 'sqrt'
  | 'bounds'
  | 'constant'
  | 'operator'
  | 'function'
  | 'greek'
  | 'group';

export interface Token {
  id: string;
  type: TokenType;
  value: string;
  rawLatex: string;
  color: string;
  children?: Token[];
  bounds?: {
    lower?: string;
    upper?: string;
  };
  parent?: string;
}

export interface ColorMap {
  [variableName: string]: string;
}

export interface ParsedEquation {
  tokens: Token[];
  colorMap: ColorMap;
  colorizedLatex: string;
  originalLatex: string;
}

export interface Explanation {
  html: string;
  plainText: string;
}

export interface ExampleEquation {
  id: string;
  name: string;
  latex: string;
  category: EquationCategory;
  complexity: 1 | 2 | 3 | 4 | 5;
  description?: string;
}

export type EquationCategory =
  | 'Calculus'
  | 'Statistics'
  | 'Physics'
  | 'Signal Processing'
  | 'Algebra'
  | 'Geometry'
  | 'Probability'
  | 'Fundamentals';

export const TOKEN_COLORS: Record<TokenType, string> = {
  result_var: '#14b8a6',
  input_var: '#f97316',
  index_var: '#ef4444',
  summation: '#a855f7',
  product: '#a855f7',
  integral: '#a855f7',
  limit: '#a855f7',
  fraction: '#3b82f6',
  exponent: '#06b6d4',
  subscript: '#6b7280',
  sqrt: '#3b82f6',
  bounds: '#22c55e',
  constant: '#22c55e',
  operator: '#6b7280',
  function: '#ec4899',
  greek: '#f97316',
  group: '#6b7280',
};

export const TOKEN_LABELS: Record<TokenType, string> = {
  result_var: 'Result',
  input_var: 'Input',
  index_var: 'Index',
  summation: 'Sum',
  product: 'Product',
  integral: 'Integral',
  limit: 'Limit',
  fraction: 'Fraction',
  exponent: 'Exponent',
  subscript: 'Subscript',
  sqrt: 'Square Root',
  bounds: 'Bounds',
  constant: 'Constant',
  operator: 'Operator',
  function: 'Function',
  greek: 'Greek Letter',
  group: 'Group',
};
