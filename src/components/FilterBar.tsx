import { useMemo } from 'react';
import { Users, Plug, RotateCcw } from 'lucide-react';
import type { Room } from '@/lib/types';

export interface FilterState {
  attendees: number;
  equipment: string[];
}

interface FilterBarProps {
  rooms: Room[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

const DEFAULT_STATE: FilterState = { attendees: 0, equipment: [] };

export function defaultFilterState(): FilterState {
  return { ...DEFAULT_STATE };
}

export default function FilterBar({ rooms, state, onChange, onReset }: FilterBarProps) {
  const equipmentOptions = useMemo(
    () =>
      Array.from(new Set(rooms.flatMap((r) => r.equipment))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [rooms],
  );

  const toggleEquipment = (item: string) => {
    const next = state.equipment.includes(item)
      ? state.equipment.filter((e) => e !== item)
      : [...state.equipment, item];
    onChange({ ...state, equipment: next });
  };

  const isDefault =
    state.attendees === DEFAULT_STATE.attendees &&
    state.equipment.length === DEFAULT_STATE.equipment.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Plug className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Filter rooms
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={isDefault}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Attendees */}
      <div className="mb-4">
        <label
          htmlFor="attendees"
          className="block text-xs font-semibold text-slate-600 mb-1.5"
        >
          Attendees
        </label>
        <div className="relative">
          <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="attendees"
            type="number"
            min={0}
            step={1}
            placeholder="0"
            value={state.attendees === 0 ? '' : state.attendees}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...state, attendees: Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0 });
            }}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
          />
        </div>
      </div>

      {/* Equipment checkboxes */}
      {equipmentOptions.length > 0 && (
        <div>
          <span className="block text-xs font-semibold text-slate-600 mb-2">
            Equipment
          </span>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((item) => {
              const checked = state.equipment.includes(item);
              return (
                <label
                  key={item}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-lg border px-2.5 py-1.5 cursor-pointer transition select-none ${
                    checked
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEquipment(item)}
                    className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
                  />
                  {item}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
