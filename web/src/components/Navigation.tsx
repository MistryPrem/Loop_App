import React from 'react';
import { NavLink } from 'react-router-dom';
import { CircleDot, Bell, Settings, HeartPulse } from 'lucide-react';
import { useWebA11y } from '../context/WebA11yContext';

export const Navigation: React.FC = () => {
  const { simpleMode } = useWebA11y();

  const links = [
    { to: '/', label: simpleMode ? 'My Medicine' : 'My Loops', icon: CircleDot },
    { to: '/feed', label: 'Loop Feed', icon: Bell },
    { to: '/emergency', label: 'Emergency', icon: HeartPulse },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl">
            L
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            Loop
          </span>
        </div>

        <ul className="flex items-center space-x-2 sm:space-x-4">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 sm:px-4 py-3 rounded-xl font-bold text-base sm:text-lg transition-colors min-h-[48px] ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-2 border-teal-600'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-6 h-6 shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
