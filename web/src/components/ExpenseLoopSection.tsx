import React, { useState } from 'react';
import { calculateExpenseBalances, ExpenseEntry, MemberBalance } from '@loop/shared/domainLogic';
import { CheckCircle2 } from 'lucide-react';

export const ExpenseLoopSection: React.FC = () => {
  const allMembers = [
    { id: 'user-1', name: 'Alex' },
    { id: 'user-2', name: 'Sam' },
    { id: 'user-3', name: 'Jordan' }
  ];

  const [expenses] = useState<ExpenseEntry[]>([
    {
      id: 'exp-1',
      payerId: 'user-1',
      payerName: 'Alex',
      amount: 60,
      splitBetween: ['user-1', 'user-2', 'user-3'],
      splitMode: 'equal'
    },
    {
      id: 'exp-2',
      payerId: 'user-2',
      payerName: 'Sam',
      amount: 45,
      splitBetween: ['user-1', 'user-2', 'user-3'],
      splitMode: 'equal'
    }
  ]);

  const [settledMessage, setSettledMessage] = useState<string | null>(null);

  const memberIds = allMembers.map((m) => m.id);
  const balances = calculateExpenseBalances(expenses, memberIds);

  const handleSettleUp = (debtorName: string, creditorName: string, amount: number) => {
    setSettledMessage(`Recorded: ${debtorName} paid $${amount.toFixed(2)} to ${creditorName}!`);
    setTimeout(() => setSettledMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Shared Expenses & Running Balances
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-base">
          Transparent split with running net tallies and zero guesswork.
        </p>
      </header>

      {settledMessage && (
        <div
          role="status"
          className="p-4 bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-500 rounded-2xl text-emerald-800 dark:text-emerald-200 font-bold"
        >
          ✓ {settledMessage}
        </div>
      )}

      {/* Running Balance Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {balances.map((b: MemberBalance) => {
          const member = allMembers.find((m) => m.id === b.userId);
          const isOwed = b.netBalance > 0;
          const isNeutral = b.netBalance === 0;

          return (
            <div
              key={b.userId}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center"
            >
              <p className="font-bold text-lg text-slate-900 dark:text-white">
                {member?.name}
              </p>
              <p
                className={`text-2xl font-extrabold mt-1 ${
                  isNeutral
                    ? 'text-slate-500 dark:text-slate-400'
                    : isOwed
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isNeutral
                  ? '$0.00'
                  : isOwed
                  ? `+$${b.netBalance.toFixed(2)}`
                  : `-$${Math.abs(b.netBalance).toFixed(2)}`}
              </p>
              <p className="text-xs uppercase font-bold tracking-wider mt-1 text-slate-500">
                {isNeutral ? 'Settled up' : isOwed ? 'Gets back' : 'Owes loop'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Settle Up Flow */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-3">
          Suggested Settlement
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 text-base font-bold text-slate-900 dark:text-white">
            <span>Jordan owes Alex</span>
            <span className="text-rose-600 dark:text-rose-400 text-lg">$15.00</span>
          </div>

          <button
            type="button"
            onClick={() => handleSettleUp('Jordan', 'Alex', 15.00)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-5 py-2.5 rounded-xl min-h-[48px] focus:ring-4 focus:ring-teal-300"
          >
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>Record Settlement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
