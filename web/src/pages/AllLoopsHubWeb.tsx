import React, { useState } from 'react';
import { HabitStreakGrid } from '../components/HabitStreakGrid';
import { ChoreLoopSection } from '../components/ChoreLoopSection';
import { ExpenseLoopSection } from '../components/ExpenseLoopSection';
import { CaregiverFeedWeb } from './CaregiverFeedWeb';
import { Sparkles, CheckCircle2, RotateCw, Wallet } from 'lucide-react';

export const AllLoopsHubWeb: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'habits' | 'chores' | 'expenses' | 'medicine'>('habits');

  // Habit check-in state
  const [readingCheckIns, setReadingCheckIns] = useState<string[]>([
    '2026-09-29',
    '2026-09-28',
    '2026-09-27',
    '2026-09-26',
    '2026-09-24',
    '2026-09-23'
  ]);
  const [isReadToday, setIsReadToday] = useState(false);

  const handleReadCheckIn = () => {
    const today = new Date().toISOString().slice(0, 10);
    setReadingCheckIns((prev) => [today, ...prev]);
    setIsReadToday(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Category Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {[
          { id: 'habits', label: 'Habit Loops', icon: Sparkles },
          { id: 'chores', label: 'Chore Loops', icon: RotateCw },
          { id: 'expenses', label: 'Expense Loops', icon: Wallet },
          { id: 'medicine', label: 'Medicine Caregiver', icon: CheckCircle2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-extrabold text-base sm:text-lg min-h-[48px] border-2 transition-all ${
                isActive
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          <HabitStreakGrid
            habitTitle="Daily 30-Min Reading / Learning"
            checkInDates={readingCheckIns}
            onCheckInToday={handleReadCheckIn}
            isCompletedToday={isReadToday}
          />
          <HabitStreakGrid
            habitTitle="Morning Walk & Mobility"
            checkInDates={['2026-09-29', '2026-09-28', '2026-09-27']}
          />
        </div>
      )}

      {activeTab === 'chores' && <ChoreLoopSection />}

      {activeTab === 'expenses' && <ExpenseLoopSection />}

      {activeTab === 'medicine' && <CaregiverFeedWeb />}
    </div>
  );
};
