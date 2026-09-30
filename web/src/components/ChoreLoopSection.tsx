import React, { useState } from 'react';
import { getNextChoreAssignee } from '@loop/shared/domainLogic';
import { RotateCw, CheckSquare, Clock } from 'lucide-react';

interface Chore {
  id: string;
  title: string;
  assignedToName: string;
  assignedToId: string;
  rotationMembers: { id: string; name: string }[];
  dueTime: string;
  isOverdue: boolean;
}

export const ChoreLoopSection: React.FC = () => {
  const [chores, setChores] = useState<Chore[]>([
    {
      id: 'chore-1',
      title: 'Kitchen Counter & Dishes',
      assignedToName: 'Alex',
      assignedToId: 'user-1',
      rotationMembers: [
        { id: 'user-1', name: 'Alex' },
        { id: 'user-2', name: 'Sam' },
        { id: 'user-3', name: 'Jordan' }
      ],
      dueTime: 'Tonight 08:00 PM',
      isOverdue: false
    },
    {
      id: 'chore-2',
      title: 'Take out Recycling & Compost',
      assignedToName: 'Sam',
      assignedToId: 'user-2',
      rotationMembers: [
        { id: 'user-1', name: 'Alex' },
        { id: 'user-2', name: 'Sam' },
        { id: 'user-3', name: 'Jordan' }
      ],
      dueTime: 'Yesterday 09:00 PM',
      isOverdue: true
    }
  ]);

  const handleCompleteChore = (choreId: string) => {
    setChores((prev) =>
      prev.map((c) => {
        if (c.id !== choreId) return c;
        const memberIds = c.rotationMembers.map((m) => m.id);
        const nextId = getNextChoreAssignee(memberIds, c.assignedToId);
        const nextMember = c.rotationMembers.find((m) => m.id === nextId);

        return {
          ...c,
          assignedToId: nextId,
          assignedToName: nextMember?.name || 'Next Member',
          isOverdue: false
        };
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Shared Roommate Chores
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Rotates automatically to the next roommate when marked done.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {chores.map((chore) => (
          <div
            key={chore.id}
            className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 shadow-sm space-y-4 ${
              chore.isOverdue
                ? 'border-rose-400 dark:border-rose-900 bg-rose-50/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-sm font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200">
                <RotateCw className="w-4 h-4" aria-hidden="true" />
                <span>Next up: {chore.assignedToName}</span>
              </span>

              {chore.isOverdue && (
                <span className="inline-flex items-center space-x-1 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/70 px-2.5 py-1 rounded-full">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>Overdue</span>
                </span>
              )}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {chore.title}
            </h3>

            <p className="text-slate-600 dark:text-slate-300 text-base">
              Due: {chore.dueTime}
            </p>

            <button
              type="button"
              onClick={() => handleCompleteChore(chore.id)}
              className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-lg py-3.5 rounded-2xl min-h-[48px] focus:ring-4 focus:ring-teal-400 transition-colors"
            >
              <CheckSquare className="w-5 h-5" aria-hidden="true" />
              <span>Mark Done & Pass Rotation</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
