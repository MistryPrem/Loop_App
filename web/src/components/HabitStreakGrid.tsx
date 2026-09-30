import React from 'react';
import { calculateHabitStreak, HabitStreakResult } from '@loop/shared/domainLogic';
import { Flame, Trophy, TrendingUp } from 'lucide-react';

interface HabitStreakGridProps {
  habitTitle: string;
  checkInDates: string[]; // YYYY-MM-DD
  onCheckInToday?: () => void;
  isCompletedToday?: boolean;
}

export const HabitStreakGrid: React.FC<HabitStreakGridProps> = ({
  habitTitle,
  checkInDates,
  onCheckInToday,
  isCompletedToday = false
}) => {
  const streak = calculateHabitStreak(checkInDates, 14);

  return (
    <section
      aria-label={`Habit progress for ${habitTitle}`}
      className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {habitTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base mt-0.5">
            Daily Shared Accountability
          </p>
        </div>

        {/* Action Button */}
        {!isCompletedToday ? (
          <button
            type="button"
            onClick={onCheckInToday}
            className="inline-flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg px-6 py-3 rounded-2xl min-h-[48px] shadow-sm focus:ring-4 focus:ring-teal-300 transition-transform active:scale-95"
          >
            <span>✓ Mark Done Today</span>
          </button>
        ) : (
          <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-2xl font-bold text-base">
            <span>✓ Done Today</span>
          </div>
        )}
      </div>

      {/* Screen Reader Alternative Announcement */}
      <p className="sr-only">
        {streak.screenReaderSummary}
      </p>

      {/* Glanceable Streak Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <Flame className="w-6 h-6 text-amber-500 mx-auto mb-1" aria-hidden="true" />
          <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Current</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {streak.currentStreak} <span className="text-sm font-semibold">days</span>
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <Trophy className="w-6 h-6 text-teal-600 dark:text-teal-400 mx-auto mb-1" aria-hidden="true" />
          <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Best Streak</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {streak.longestStreak} <span className="text-sm font-semibold">days</span>
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <TrendingUp className="w-6 h-6 text-indigo-500 mx-auto mb-1" aria-hidden="true" />
          <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Fortnight</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {streak.weeklyCompletionRate}%
          </p>
        </div>
      </div>

      {/* Contribution-Style 14-Day Visual Grid */}
      <div aria-hidden="true" className="pt-2">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">
          14-Day Visual History (Color + Text Indicator)
        </p>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {streak.gridDays.map((day: HabitStreakResult['gridDays'][number]) => (
            <div
              key={day.date}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 text-center transition-all ${
                day.completed
                  ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              <span className="text-xs font-bold">{day.dayOfWeek}</span>
              <span className="text-base font-extrabold my-0.5">
                {day.completed ? '✓' : '—'}
              </span>
              <span className="text-[10px] font-semibold">{day.date.slice(8, 10)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
