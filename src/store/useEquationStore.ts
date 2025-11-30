import { create } from 'zustand';
import type { ParsedEquation, Explanation } from '../types/latex';
import { parseLatex, validateLatex } from '../lib/latexParser';
import { generateExplanation } from '../lib/api';

interface EquationState {
  latex: string;
  parsedEquation: ParsedEquation | null;
  explanation: Explanation | null;
  isLoading: boolean;
  isParsing: boolean;
  error: string | null;
  validationError: string | null;
  hoveredTokenId: string | null;
  darkMode: boolean;

  setLatex: (latex: string) => void;
  parseEquation: () => void;
  fetchExplanation: (detailLevel?: 'brief' | 'detailed') => Promise<void>;
  setHoveredToken: (id: string | null) => void;
  toggleDarkMode: () => void;
  reset: () => void;
  loadExample: (latex: string) => void;
}

export const useEquationStore = create<EquationState>((set, get) => ({
  latex: '',
  parsedEquation: null,
  explanation: null,
  isLoading: false,
  isParsing: false,
  error: null,
  validationError: null,
  hoveredTokenId: null,
  darkMode: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,

  setLatex: (latex) => {
    const validation = validateLatex(latex);
    set({
      latex,
      validationError: validation.valid ? null : validation.error,
      error: null,
    });
  },

  parseEquation: () => {
    const { latex } = get();
    if (!latex.trim()) {
      set({ parsedEquation: null, error: null });
      return;
    }

    set({ isParsing: true, error: null });

    try {
      const parsed = parseLatex(latex);
      set({ parsedEquation: parsed, isParsing: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to parse equation',
        isParsing: false,
      });
    }
  },

  fetchExplanation: async (detailLevel = 'brief') => {
    const { latex, parsedEquation } = get();
    if (!parsedEquation) return;

    set({ isLoading: true, error: null });

    try {
      const explanation = await generateExplanation(
        latex,
        parsedEquation.tokens,
        detailLevel
      );
      set({ explanation, isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to generate explanation',
        isLoading: false,
      });
    }
  },

  setHoveredToken: (id) => {
    set({ hoveredTokenId: id });
  },

  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.darkMode;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', newDarkMode);
      }
      return { darkMode: newDarkMode };
    });
  },

  reset: () => {
    set({
      latex: '',
      parsedEquation: null,
      explanation: null,
      error: null,
      validationError: null,
      hoveredTokenId: null,
    });
  },

  loadExample: (latex) => {
    set({
      latex,
      parsedEquation: null,
      explanation: null,
      error: null,
      validationError: null,
    });

    setTimeout(() => get().parseEquation(), 0);
  },
}));
