import { useMemo } from 'react';
import type { Booking, Interval } from '@/lib/types';
import { fmtTime, MINUTES_PER_DAY } from '@/lib/availability';

const HOURS = Array.from({ length: 25 }, (_, i) => i); // 0..24

// Width thresholds (as % of the 24h timeline) for deciding what label content fits.
// ~7% ≈ 100 min, ~11% ≈ 158 min on a typical desktop container.
const SHOW_TITLE_PCT = 7;
const SHOW_TIME_PCT = 11;

interface TimelineProps {
  bookings: Booking[];
  candidate: Interval | null;
  currentTime: number;
  blocked: boolean;
}

export default function Timeline({
  bookings,
  candidate,
  currentTime,
  blocked,
}: TimelineProps) {
  const blocks = useMemo(
    () =>
      bookings.map((b) => {
        const widthPct = ((b.end - b.start) / MINUTES_PER_DAY) * 100;
        return {
          id: b.id,
          title: b.title,
          start: b.start,
          end: b.end,
          left: (b.start / MINUTES_PER_DAY) * 100,
          widthPct,
          showTitle: widthPct >= SHOW_TITLE_PCT,
          showTime: widthPct >= SHOW_TIME_PCT,
        };
      }),
    [bookings],
  );

  const candidateLeft = candidate ? (candidate.start / MINUTES_PER_DAY) * 100 : 0;
  const candidateWidth = candidate
    ? ((candidate.end - candidate.start) / MINUTES_PER_DAY) * 100
    : 0;
  const candidateTooNarrow = candidateWidth < SHOW_TITLE_PCT;
  const nowLeft = (currentTime / MINUTES_PER_DAY) * 100;

  return (
    <div className="select-none">
      <div className="relative h-28 rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden">
        {/* Hour gridlines */}
        {HOURS.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200/70"
            style={{ left: `${(h / 24) * 100}%` }}
          />
        ))}

        {/* Existing bookings */}
        {blocks.map((b) => (
          <div
            key={b.id}
            className="absolute top-3 bottom-3 rounded-md bg-slate-300/90 border border-slate-400/60 overflow-hidden flex items-center"
            style={{
              left: `${b.left}%`,
              width: `${b.widthPct}%`,
              minWidth: b.showTitle ? undefined : '20px',
            }}
            title={`${b.title} · ${fmtTime(b.start)}–${fmtTime(b.end)}`}
          >
            {b.showTime ? (
              <div className="px-1.5 py-0.5 leading-tight">
                <p className="text-[10px] font-semibold text-slate-700 truncate">
                  {b.title}
                </p>
                <p className="text-[9px] text-slate-500 truncate">
                  {fmtTime(b.start)}–{fmtTime(b.end)}
                </p>
              </div>
            ) : b.showTitle ? (
              <span className="text-[10px] font-medium text-slate-700 truncate px-1.5">
                {b.title}
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mx-auto shrink-0" />
            )}
          </div>
        ))}

        {/* Candidate interval */}
        {candidate && (
          <div
            className={`absolute top-12 bottom-9 rounded-md border-2 flex items-center justify-center ${
              blocked
                ? 'bg-rose-200/70 border-rose-500'
                : 'bg-emerald-200/70 border-emerald-500'
            }`}
            style={{ left: `${candidateLeft}%`, width: `${candidateWidth}%` }}
            title={`${fmtTime(candidate.start)}–${fmtTime(candidate.end)}`}
          >
            <span
              className={`text-[10px] font-semibold text-slate-800 truncate px-1 ${
                candidateTooNarrow ? 'hidden' : ''
              }`}
            >
              {fmtTime(candidate.start)}–{fmtTime(candidate.end)}
            </span>
          </div>
        )}

        {/* Current time marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-sky-500"
          style={{ left: `${nowLeft}%` }}
        >
          <span className="absolute -top-0 -translate-x-1/2 text-[9px] font-bold text-sky-600 bg-white px-1 rounded-b">
            NOW
          </span>
        </div>
      </div>

      {/* Hour labels */}
      <div className="relative mt-1.5 h-4 text-[10px] text-slate-400">
        {[0, 6, 12, 18, 24].map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2 font-medium"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            {fmtTime(h * 60)}
          </span>
        ))}
      </div>
    </div>
  );
}
