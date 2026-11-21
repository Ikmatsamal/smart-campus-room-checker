import type { Room } from '@/lib/types';
import { Users, Lock, MapPin } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onSelect: () => void;
  bookingCount: number;
}

export default function RoomCard({
  room,
  selected,
  onSelect,
  bookingCount,
}: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
        selected
          ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-500/30 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm truncate">
            {room.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{room.building}</span>
          </div>
        </div>
        {room.blocked ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-rose-600 bg-rose-50 px-2 py-1 rounded-full shrink-0">
            <Lock className="w-3 h-3" /> Blocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full shrink-0">
            Open
          </span>
        )}
      </div>
      {room.equipment.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {room.equipment.map((item) => (
            <span
              key={item}
              className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded"
            >
              {item}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {room.capacity} seats
        </span>
        <span>{bookingCount} booking{bookingCount !== 1 ? 's' : ''}</span>
      </div>
    </button>
  );
}
