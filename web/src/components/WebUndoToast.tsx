import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface UndoToastProps {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationSeconds?: number;
}

export const WebUndoToast: React.FC<UndoToastProps> = ({
  visible,
  message,
  onUndo,
  onDismiss,
  durationSeconds = 10
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (!visible) return;
    setSecondsRemaining(durationSeconds);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, durationSeconds, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl border-2 border-teal-500 z-50 flex items-center justify-between"
    >
      <div className="flex-1 pr-4">
        <p className="font-bold text-lg">{message}</p>
        <p className="text-sm opacity-80 mt-0.5">
          Auto-confirms in {secondsRemaining}s
        </p>
      </div>

      <button
        type="button"
        onClick={onUndo}
        className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-5 py-3 rounded-xl min-h-[48px] focus:ring-4 focus:ring-amber-300"
      >
        <RotateCcw className="w-5 h-5" aria-hidden="true" />
        <span>Undo</span>
      </button>
    </div>
  );
};
