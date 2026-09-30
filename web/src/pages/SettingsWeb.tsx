import React from 'react';
import { useWebA11y, WebTheme } from '../context/WebA11yContext';

export const SettingsWeb: React.FC = () => {
  const {
    theme,
    setTheme,
    simpleMode,
    setSimpleMode,
    reduceMotion,
    setReduceMotion
  } = useWebA11y();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Accessibility & Display Settings
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
          Customize high-contrast modes, text sizing, and motion preferences.
        </p>
      </header>

      {/* Simple Patient Mode */}
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="pr-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Simple Patient Mode
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base mt-1">
            Focuses the entire app on a single large medicine card with a giant 'Taken' button.
          </p>
        </div>

        <input
          type="checkbox"
          id="simple-mode-toggle"
          checked={simpleMode}
          onChange={(e) => setSimpleMode(e.target.checked)}
          className="w-8 h-8 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
      </section>

      {/* Theme Selection */}
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Color & Contrast Theme
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base mt-1">
            Select high-contrast mode for enhanced AAA readability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['light', 'dark', 'highContrast'] as WebTheme[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`py-4 px-4 rounded-xl font-bold text-lg min-h-[48px] border-2 transition-all ${
                theme === t
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200'
                  : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              {t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '👁️ High Contrast'}
            </button>
          ))}
        </div>
      </section>

      {/* Reduced Motion */}
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="pr-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Reduce Motion
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base mt-1">
            Disables all non-essential sliding animations and visual transitions.
          </p>
        </div>

        <input
          type="checkbox"
          id="reduce-motion-toggle"
          checked={reduceMotion}
          onChange={(e) => setReduceMotion(e.target.checked)}
          className="w-8 h-8 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
      </section>
    </div>
  );
};
