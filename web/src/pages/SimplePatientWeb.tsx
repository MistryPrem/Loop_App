import React, { useState } from 'react';
import { Volume2, CheckCircle, Clock } from 'lucide-react';
import { useWebA11y } from '../context/WebA11yContext';
import { WebUndoToast } from '../components/WebUndoToast';
import { getWebSocket } from '../services/socket';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';

export const SimplePatientWeb: React.FC = () => {
  const { announce } = useWebA11y();

  const [dose, setDose] = useState({
    id: 'dose-web-1',
    loopId: 'loop-family-med',
    title: 'Amlodipine (Blood Pressure)',
    dosage: '5mg - 1 White Tablet',
    instructions: 'Take with a full glass of water after breakfast',
    time: '08:00 AM',
    taken: false
  });

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleTaken = () => {
    setDose((prev) => ({ ...prev, taken: true }));
    setToastMessage(`✓ Taken: ${dose.title}`);
    setToastVisible(true);
    announce(`Marked ${dose.title} as taken. You have 10 seconds to undo.`);

    const socket = getWebSocket();
    if (socket && socket.connected) {
      socket.emit(SOCKET_EVENTS.CLIENT_CHECKIN_CREATE, {
        loopId: dose.loopId,
        itemId: dose.id,
        status: 'taken'
      });
    }
  };

  const handleSkip = () => {
    setDose((prev) => ({ ...prev, taken: true }));
    setToastMessage(`Skipped: ${dose.title}`);
    setToastVisible(true);
    announce(`Skipped ${dose.title}.`);

    const socket = getWebSocket();
    if (socket && socket.connected) {
      socket.emit(SOCKET_EVENTS.CLIENT_CHECKIN_CREATE, {
        loopId: dose.loopId,
        itemId: dose.id,
        status: 'skipped'
      });
    }
  };

  const handleUndo = () => {
    setDose((prev) => ({ ...prev, taken: false }));
    setToastVisible(false);
    announce('Check-in undone.');
  };

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Time to take your ${dose.title}, ${dose.dosage}. ${dose.instructions}`
      );
      utterance.rate = 0.85; // Calm, clear speech rate
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Patient Mode Big Card */}
      <section
        aria-labelledby="dose-heading"
        className="bg-white dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-700 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-4 py-2 rounded-xl font-bold text-lg">
            <Clock className="w-5 h-5" aria-hidden="true" />
            <span>Due at {dose.time}</span>
          </span>

          <button
            type="button"
            onClick={handleReadAloud}
            aria-label="Read medicine details out loud"
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors focus:ring-4 focus:ring-teal-400"
          >
            <Volume2 className="w-7 h-7 text-slate-700 dark:text-slate-200" aria-hidden="true" />
          </button>
        </div>

        <div>
          <h1 id="dose-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {dose.title}
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400 mt-2">
            {dose.dosage}
          </p>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            {dose.instructions}
          </p>
        </div>

        {!dose.taken ? (
          <div className="pt-4 space-y-4">
            <button
              type="button"
              onClick={handleTaken}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-2xl py-6 rounded-2xl min-h-[64px] shadow-md transition-transform active:scale-[0.98] focus:ring-4 focus:ring-emerald-300 flex items-center justify-center space-x-3"
            >
              <CheckCircle className="w-8 h-8" aria-hidden="true" />
              <span>✓ Taken</span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline font-semibold text-lg py-3 min-h-[48px]"
            >
              Skip this dose
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              ✓ All set for this scheduled dose!
            </p>
          </div>
        )}
      </section>

      <WebUndoToast
        visible={toastVisible}
        message={toastMessage}
        onUndo={handleUndo}
        onDismiss={() => setToastVisible(false)}
      />
    </div>
  );
};
