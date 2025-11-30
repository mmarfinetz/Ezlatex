import { useEffect, useRef } from 'react';
import katex from 'katex';
import { useEquationStore } from '../store/useEquationStore';

export function ColorizedEquation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { parsedEquation, latex } = useEquationStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const latexToRender = parsedEquation?.colorizedLatex || latex;

    if (!latexToRender.trim()) {
      containerRef.current.innerHTML = '';
      return;
    }

    try {
      katex.render(latexToRender, containerRef.current, {
        throwOnError: false,
        displayMode: true,
        output: 'html',
        trust: true,
      });
    } catch (e) {
      containerRef.current.innerHTML = `<span class="text-red-500">Error rendering equation</span>`;
    }
  }, [parsedEquation, latex]);

  if (!latex.trim()) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
        <p className="text-gray-400 dark:text-gray-500 text-lg">
          Your equation will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div
        className={`
          p-8 bg-white dark:bg-gray-900
          rounded-xl shadow-sm
          border border-gray-200 dark:border-gray-800
          transition-all duration-300
        `}
      >
        <div
          ref={containerRef}
          className="katex-display text-2xl overflow-x-auto"
          style={{ minHeight: '3rem' }}
        />
      </div>
    </div>
  );
}
