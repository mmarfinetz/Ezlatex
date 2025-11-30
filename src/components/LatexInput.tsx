import { useCallback, useEffect, useRef } from 'react';
import { useEquationStore } from '../store/useEquationStore';

export function LatexInput() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    latex,
    setLatex,
    parseEquation,
    fetchExplanation,
    validationError,
    isLoading,
  } = useEquationStore();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLatex(e.target.value);
    },
    [setLatex]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (latex.trim()) {
        parseEquation();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [latex, parseEquation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        parseEquation();
        fetchExplanation('brief');
      }
    },
    [parseEquation, fetchExplanation]
  );

  const handleExplain = () => {
    parseEquation();
    fetchExplanation('brief');
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={latex}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter LaTeX equation... e.g., X_k = \sum_{n=0}^{N-1} x_n \cdot e^{-i2\pi kn/N}"
          className={`
            w-full h-32 p-4
            font-mono text-sm
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            border rounded-xl
            transition-all duration-200
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2
            ${
              validationError
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:focus:ring-red-900'
                : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 focus:ring-gray-100 dark:focus:ring-gray-800'
            }
          `}
        />
        {validationError && (
          <p className="absolute -bottom-6 left-4 text-sm text-red-500">
            {validationError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleExplain}
          disabled={!latex.trim() || !!validationError || isLoading}
          className={`
            px-6 py-3 rounded-lg font-medium text-white
            bg-gray-900 dark:bg-white dark:text-gray-900
            hover:bg-gray-800 dark:hover:bg-gray-100
            disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:cursor-not-allowed
            transition-all duration-200
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Explaining...
            </span>
          ) : (
            'Explain'
          )}
        </button>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          or press{' '}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
            ⌘/Ctrl + Enter
          </kbd>
        </span>
      </div>
    </div>
  );
}
