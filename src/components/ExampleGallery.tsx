import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { exampleEquations } from '../data/examples';
import { useEquationStore } from '../store/useEquationStore';
import type { ExampleEquation, EquationCategory } from '../types/latex';

function EquationPreview({ latex }: { latex: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(latex, ref.current, {
          throwOnError: false,
          displayMode: false,
          output: 'html',
        });
      } catch {
        ref.current.textContent = latex;
      }
    }
  }, [latex]);

  return <div ref={ref} className="text-sm overflow-hidden" />;
}

function ComplexityDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= level
              ? 'bg-gray-900 dark:bg-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

function ExampleCard({ example }: { example: ExampleEquation }) {
  const { loadExample } = useEquationStore();

  return (
    <button
      onClick={() => loadExample(example.latex)}
      className={`
        group relative p-4 text-left
        bg-white dark:bg-gray-900
        rounded-xl shadow-sm
        border border-gray-200 dark:border-gray-800
        hover:border-gray-300 dark:hover:border-gray-700
        hover:shadow-md
        transition-all duration-200
      `}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {example.name}
          </h3>
          <ComplexityDots level={example.complexity} />
        </div>

        <div className="h-12 flex items-center">
          <EquationPreview latex={example.latex} />
        </div>

        <div className="flex items-center justify-between">
          <span className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
            {example.category}
          </span>
        </div>

        {example.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {example.description}
          </p>
        )}
      </div>
    </button>
  );
}

export function ExampleGallery() {
  const [selectedCategory, setSelectedCategory] = useState<EquationCategory | 'All'>('All');
  const [isExpanded, setIsExpanded] = useState(true);

  const categories: (EquationCategory | 'All')[] = [
    'All',
    'Calculus',
    'Statistics',
    'Physics',
    'Signal Processing',
    'Algebra',
    'Geometry',
    'Probability',
    'Fundamentals',
  ];

  const filteredExamples =
    selectedCategory === 'All'
      ? exampleEquations
      : exampleEquations.filter((e) => e.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Example Equations
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md
                  transition-all duration-200
                  ${
                    selectedCategory === cat
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExamples.map((example) => (
              <ExampleCard key={example.id} example={example} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
