import { useState } from 'react';
import { TOKEN_COLORS, TOKEN_LABELS, type TokenType } from '../types/latex';

const legendItems: { type: TokenType; description: string }[] = [
  { type: 'result_var', description: 'The output or what we\'re solving for' },
  { type: 'input_var', description: 'Input values or known quantities' },
  { type: 'index_var', description: 'Loop counters or iteration variables' },
  { type: 'summation', description: 'Sum over a range of values' },
  { type: 'fraction', description: 'Division or ratios' },
  { type: 'exponent', description: 'Powers and exponential expressions' },
  { type: 'bounds', description: 'Limits and boundary values' },
  { type: 'function', description: 'Mathematical functions (sin, log, etc.)' },
];

export function ColorLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-2 px-4 py-2
          bg-white dark:bg-gray-800 rounded-xl
          border-2 border-gray-200 dark:border-gray-700
          shadow-sm hover:shadow-md
          transition-all duration-200
          ${isExpanded ? 'rounded-b-none border-b-0' : ''}
        `}
      >
        <div className="flex gap-1">
          {['#14b8a6', '#a855f7', '#f97316', '#06b6d4'].map((color) => (
            <div
              key={color}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Color Legend
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 right-0 z-10 bg-white dark:bg-gray-800 rounded-b-xl border-2 border-t-0 border-gray-200 dark:border-gray-700 shadow-lg p-4">
          <div className="grid gap-3">
            {legendItems.map(({ type, description }) => (
              <div key={type} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: TOKEN_COLORS[type] }}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {TOKEN_LABELS[type]}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
