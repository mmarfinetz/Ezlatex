import { useEffect, useRef } from 'react';
import { useEquationStore } from '../store/useEquationStore';
import { renderMathInElement } from '../lib/katexAutoRender';

export function PlainEnglish() {
  const { explanation, isLoading, error, fetchExplanation, parsedEquation } =
    useEquationStore();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const copyAsHtml = () => {
    if (explanation?.html) {
      navigator.clipboard.writeText(explanation.html);
    }
  };

  const copyAsText = () => {
    if (explanation?.plainText) {
      navigator.clipboard.writeText(explanation.plainText);
    }
  };

  useEffect(() => {
    if (!explanation?.html || !containerRef.current) return;

    // Use requestAnimationFrame to ensure DOM has updated after dangerouslySetInnerHTML
    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      try {
        renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
          ],
          throwOnError: false,
        });
      } catch (e) {
        // If math rendering fails for any reason, leave the raw text.
        console.error('Error rendering math in explanation', e);
      }
    });
  }, [explanation?.html]);

  if (isLoading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="space-y-3">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <div className="text-red-500 text-xl">⚠️</div>
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">
              Error generating explanation
            </p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              {error}
            </p>
            <button
              onClick={() => fetchExplanation('brief')}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!explanation && !parsedEquation) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
        <p className="text-gray-400 dark:text-gray-500">
          Click "Explain" to see a plain English explanation
        </p>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Ready to explain! Click the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div
          ref={containerRef}
          className="text-lg leading-relaxed text-gray-700 dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: explanation.html }}
        />

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={copyAsHtml}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Copy HTML
          </button>
          <button
            onClick={copyAsText}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Copy Text
          </button>
          <button
            onClick={() => fetchExplanation('detailed')}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            More detail
          </button>
          <button
            onClick={() => fetchExplanation('brief')}
            className="ml-auto px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
