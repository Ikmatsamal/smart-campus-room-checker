import { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { AvailabilityResult } from '@/lib/types';
import {
  explainAvailability,
  setSimulateAdapterFailure,
} from '@/lib/explainAvailability';

interface ExplainAvailabilityProps {
  result: AvailabilityResult;
}

type ExplainState = 'idle' | 'loading' | 'shown' | 'error';

export default function ExplainAvailability({ result }: ExplainAvailabilityProps) {
  const [state, setState] = useState<ExplainState>('idle');
  const [text, setText] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearPendingTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // A new result invalidates any previously shown explanation.
  useEffect(() => {
    clearPendingTimer();
    setState('idle');
    setText('');
  }, [result]);

  // Unmount cleanup: never let a pending timer fire.
  useEffect(() => clearPendingTimer, []);

  const handleClick = () => {
    clearPendingTimer();
    setState('loading');
    setSimulateAdapterFailure(simulateFailure);
    // Mock latency to simulate an AI round-trip; the adapter itself is local.
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      try {
        setText(explainAvailability(result));
        setState('shown');
      } catch {
        setState('error');
      }
    }, 400);
  };

  if (state === 'idle' || state === 'loading') {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={state === 'loading'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:text-sky-700 border border-slate-200 hover:border-sky-300 px-3 py-1.5 rounded-lg transition disabled:opacity-60 disabled:cursor-wait"
        >
          {state === 'loading' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          )}
          {state === 'loading' ? 'Explaining…' : 'Explain availability'}
        </button>
        <label className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
            className="w-3 h-3 rounded border-slate-300 text-sky-600 focus:ring-sky-500/40 cursor-pointer"
          />
          Simulate adapter failure (test control)
        </label>
      </div>
    );
  }

  const fallback = result.available
    ? 'The room is available for this interval.'
    : result.reason;

  return (
    <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-sky-700">
          AI explanation (mock)
        </span>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition"
        >
          Hide
        </button>
      </div>
      <p className="text-sm text-slate-700 mt-1 leading-relaxed">
        {state === 'shown' ? text : fallback}
      </p>
      {state === 'error' && (
        <p className="text-[11px] text-slate-400 mt-1">
          The explanation could not be generated, so the original result is
          shown instead.
        </p>
      )}
      <label className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={simulateFailure}
          onChange={(e) => setSimulateFailure(e.target.checked)}
          className="w-3 h-3 rounded border-slate-300 text-sky-600 focus:ring-sky-500/40 cursor-pointer"
        />
        Simulate adapter failure (test control)
      </label>
    </div>
  );
}
