import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getWebSocket } from '../services/socket';
import { useWebA11y } from '../context/WebA11yContext';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';

interface DoseItem {
  id: string;
  patientName: string;
  medicineName: string;
  dosage: string;
  dueTime: string;
  status: 'taken' | 'due' | 'missed';
}

export const CaregiverFeedWeb: React.FC = () => {
  const { announce } = useWebA11y();

  const [doses, setDoses] = useState<DoseItem[]>([
    {
      id: 'dose-web-1',
      patientName: 'Mom (Eleanor)',
      medicineName: 'Amlodipine',
      dosage: '5mg',
      dueTime: '08:00 AM',
      status: 'due'
    },
    {
      id: 'dose-web-2',
      patientName: 'Mom (Eleanor)',
      medicineName: 'Metformin',
      dosage: '500mg',
      dueTime: '12:00 PM',
      status: 'due'
    },
    {
      id: 'dose-web-3',
      patientName: 'Mom (Eleanor)',
      medicineName: 'Atorvastatin',
      dosage: '20mg',
      dueTime: 'Yesterday 09:00 PM',
      status: 'taken'
    }
  ]);

  const [nudgeNotification, setNudgeNotification] = useState<string | null>(null);

  useEffect(() => {
    const socket = getWebSocket();

    const onCheckInNew = (payload: any) => {
      setDoses((prev) =>
        prev.map((d) => (d.id === payload.itemId ? { ...d, status: payload.status } : d))
      );
      announce(`Real-time update: ${payload.userName} checked in ${payload.itemTitle} as ${payload.status}`);
    };

    socket.on(SOCKET_EVENTS.SERVER_CHECKIN_NEW, onCheckInNew);

    return () => {
      socket.off(SOCKET_EVENTS.SERVER_CHECKIN_NEW, onCheckInNew);
    };
  }, [announce]);

  const handleNudge = (item: DoseItem) => {
    const socket = getWebSocket();
    if (socket && socket.connected) {
      socket.emit(SOCKET_EVENTS.CLIENT_NUDGE_SEND, {
        loopId: 'loop-family-med',
        toUserId: 'user-patient-1',
        itemId: item.id,
        message: `Friendly reminder from caregiver: Time for your ${item.medicineName} (${item.dosage})!`
      });
    }

    setNudgeNotification(`Sent gentle reminder for ${item.medicineName}`);
    announce(`Reminder sent for ${item.medicineName}`);
    setTimeout(() => setNudgeNotification(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Caregiver Medicine Monitor
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
          Live real-time feed of scheduled doses and one-tap accountability nudges.
        </p>
      </header>

      {nudgeNotification && (
        <div
          role="status"
          className="p-4 bg-teal-50 dark:bg-teal-950 border-2 border-teal-500 rounded-2xl text-teal-800 dark:text-teal-200 font-bold text-lg"
        >
          ✓ {nudgeNotification}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {doses.map((dose) => {
          let statusBadge = (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold text-base">
              <Clock className="w-5 h-5" aria-hidden="true" />
              <span>Due</span>
            </span>
          );

          if (dose.status === 'taken') {
            statusBadge = (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold text-base">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                <span>Taken</span>
              </span>
            );
          } else if (dose.status === 'missed') {
            statusBadge = (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-bold text-base">
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
                <span>Missed</span>
              </span>
            );
          }

          return (
            <div
              key={dose.id}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    {dose.patientName}
                  </span>
                  {statusBadge}
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {dose.medicineName}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg mt-1">
                  Dosage: {dose.dosage} • Due: {dose.dueTime}
                </p>
              </div>

              {dose.status === 'due' && (
                <button
                  type="button"
                  onClick={() => handleNudge(dose)}
                  className="w-full flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl min-h-[48px] focus:ring-4 focus:ring-teal-300 transition-colors"
                >
                  <Send className="w-5 h-5" aria-hidden="true" />
                  <span>Send Friendly Nudge</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
