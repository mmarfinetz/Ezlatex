// Lightweight wrapper around KaTeX auto-render for ESM/bundler mode.
// The upstream package uses CommonJS `export =`, so we import and cast.

import renderMathInElementCjs from 'katex/contrib/auto-render';

export const renderMathInElement = renderMathInElementCjs as unknown as (
  elem: HTMLElement,
  options?: {
    delimiters?: { left: string; right: string; display: boolean }[];
    throwOnError?: boolean;
  }
) => void;
