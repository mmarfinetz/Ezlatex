import { useEffect } from 'react';
import { LatexInput } from './components/LatexInput';
import { ColorizedEquation } from './components/ColorizedEquation';
import { PlainEnglish } from './components/PlainEnglish';
import { ExampleGallery } from './components/ExampleGallery';
import { ColorLegend } from './components/ColorLegend';
import { useEquationStore } from './store/useEquationStore';

function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useEquationStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

function App() {
  const { darkMode } = useEquationStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              EzLaTeX
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Colorize equations & explain them in plain English
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ColorLegend />
            <DarkModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Enter Equation
              </h2>
              <LatexInput />
            </section>

            <section>
              <PlainEnglish />
            </section>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Colorized Result
              </h2>
              <ColorizedEquation />
            </section>
          </div>
        </main>

        {/* Example Gallery */}
        <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <ExampleGallery />
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-400 dark:text-gray-500 pt-8 space-y-2">
          <p>Built with React + KaTeX</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/mmarfinetz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/mmarfinetz7"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Twitter
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
