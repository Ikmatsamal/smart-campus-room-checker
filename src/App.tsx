import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  CalendarClock,
  Sparkles,
  SearchX,
} from 'lucide-react';
import type { AvailabilityResult, Interval } from '@/lib/types';
import {
  SAMPLE_ROOMS,
  SAMPLE_BOOKINGS,
  SAMPLE_CURRENT_TIME,
} from '@/lib/sampleData';
import {
  checkAvailability,
  fmtTime,
  parseTimeInput,
  getRoomBookings,
  MAX_BOOKING_MINUTES,
} from '@/lib/availability';
import RoomCard from '@/components/RoomCard';
import Timeline from '@/components/Timeline';
import ExplainAvailability from '@/components/ExplainAvailability';
import FilterBar, { defaultFilterState, type FilterState } from '@/components/FilterBar';
import { filterRooms } from '@/lib/filterRooms';

const MAX_DUR = MAX_BOOKING_MINUTES;

function App() {
  const [bookings] = useState(SAMPLE_BOOKINGS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('r1');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);

  const visibleRooms = useMemo(
    () => filterRooms(SAMPLE_ROOMS, filterState),
    [filterState],
  );

  // F5 support: if the selected room is filtered out, fall back to the first
  // visible room (or clear the selection when none remain).
  useEffect(() => {
    const stillVisible = visibleRooms.some((r) => r.id === selectedRoomId);
    if (stillVisible) return;
    setSelectedRoomId(visibleRooms[0]?.id ?? '');
  }, [visibleRooms, selectedRoomId]);

  const [currentTime, setCurrentTime] = useState(SAMPLE_CURRENT_TIME);
  const selectedRoom = SAMPLE_ROOMS.find((r) => r.id === selectedRoomId);
  const roomBookings = useMemo(
    () => getRoomBookings(selectedRoomId, bookings),
    [bookings, selectedRoomId],
  );

  const parsedStart = parseTimeInput(startTime);
  const parsedEnd = parseTimeInput(endTime);
  const hasValidInput = !Number.isNaN(parsedStart) && !Number.isNaN(parsedEnd);
  const candidate: Interval | null = hasValidInput
    ? { start: parsedStart, end: parsedEnd }
    : null;

  const result: AvailabilityResult = useMemo(() => {
    if (!candidate) {
      return { available: false, reason: 'Enter valid start and end times.' };
    }
    return checkAvailability(candidate, selectedRoom, bookings, currentTime);
  }, [candidate, selectedRoom, bookings, currentTime]);

  const duration = candidate ? candidate.end - candidate.start : 0;
  const durationOver = duration > MAX_DUR;
  const durationInvalid = hasValidInput && duration <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              Smart Campus Room Checker
            </h1>
            <p className="text-xs text-slate-500">
              Find an available room for your next session.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-sky-600" />
            <label htmlFor="current-time" className="font-medium hidden sm:inline">
              Current time:
            </label>
            <input
              id="current-time"
              type="time"
              value={fmtTime(currentTime)}
              onChange={(e) => {
                const m = parseTimeInput(e.target.value);
                if (!Number.isNaN(m)) setCurrentTime(m);
              }}
              className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 rounded px-1 py-0.5 cursor-pointer"
              aria-label="Current time"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: filters + room list */}
          <section className="lg:col-span-2 space-y-4">
            <FilterBar
              rooms={SAMPLE_ROOMS}
              state={filterState}
              onChange={setFilterState}
              onReset={() => setFilterState(defaultFilterState())}
            />
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Rooms
              </h2>
              <span className="text-xs text-slate-400">
                {visibleRooms.length} of {SAMPLE_ROOMS.length}
              </span>
            </div>
            <div className="space-y-3">
              {visibleRooms.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
                  <SearchX className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    No rooms match your filters
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Try lowering the attendee count or removing equipment
                    requirements.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilterState(defaultFilterState())}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg transition"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                visibleRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    selected={room.id === selectedRoomId}
                    onSelect={() => setSelectedRoomId(room.id)}
                    bookingCount={getRoomBookings(room.id, bookings).length}
                  />
                ))
              )}
            </div>
          </section>

          {/* Right: form + timeline + result */}
          <section className="lg:col-span-3 space-y-5">
            {/* Mobile current time */}
            <div className="flex sm:hidden items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-sky-600" />
              <label htmlFor="current-time-mobile" className="font-medium">
                Current time:
              </label>
              <input
                id="current-time-mobile"
                type="time"
                value={fmtTime(currentTime)}
                onChange={(e) => {
                  const m = parseTimeInput(e.target.value);
                  if (!Number.isNaN(m)) setCurrentTime(m);
                }}
                className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 rounded px-1 py-0.5 cursor-pointer"
                aria-label="Current time"
              />
            </div>

            {visibleRooms.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <SearchX className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <h2 className="font-semibold text-slate-800">
                  No rooms match your filters
                </h2>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  Adjust the filters above to find an available room.
                </p>
                <button
                  type="button"
                  onClick={() => setFilterState(defaultFilterState())}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-4 py-2 rounded-lg transition"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="w-5 h-5 text-sky-600" />
                <h2 className="font-semibold text-slate-800">
                  Check an interval
                </h2>
              </div>

              {selectedRoom && (
                <div className="mb-4 text-sm text-slate-500">
                  Selected room:{' '}
                  <span className="font-semibold text-slate-700">
                    {selectedRoom.name}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Start time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    End time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              {/* Duration pill */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500">Duration:</span>
                {durationInvalid ? (
                  <span className="font-semibold text-rose-600">
                    Invalid (end must be after start)
                  </span>
                ) : durationOver ? (
                  <span className="font-semibold text-rose-600">
                    {duration} min — exceeds the {MAX_DUR} min limit
                  </span>
                ) : (
                  <span className="font-semibold text-slate-700">
                    {duration} min
                  </span>
                )}
              </div>

              {/* Timeline */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Today&apos;s schedule
                  </h3>
                  {selectedRoom && (
                    <span className="text-xs text-slate-400">
                      {selectedRoom.name}
                    </span>
                  )}
                </div>
                <Timeline
                  bookings={roomBookings}
                  candidate={candidate}
                  currentTime={currentTime}
                  blocked={selectedRoom?.blocked ?? false}
                />
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-slate-300 border border-slate-400/60" />
                    Existing booking
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-200 border-2 border-emerald-500" />
                    Your candidate
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-px h-3 bg-sky-500" />
                    Current time
                  </span>
                </div>
              </div>
            </div>

            {/* Result banner */}
            <div
              className={`rounded-2xl border p-5 transition-all duration-300 ${
                result.available
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-rose-200 bg-rose-50/70'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.available ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3
                    className={`font-bold text-base ${
                      result.available ? 'text-emerald-800' : 'text-rose-700'
                    }`}
                  >
                    {result.available ? 'Available' : 'Unavailable'}
                  </h3>
                  {candidate && (
                    <p className="text-sm text-slate-600 mt-0.5">
                      Interval:{' '}
                      <span className="font-semibold text-slate-700">
                        {fmtTime(candidate.start)}–{fmtTime(candidate.end)}
                      </span>
                    </p>
                  )}
                  {!result.available && (
                    <p className="text-sm text-rose-600/90 mt-1">
                      {result.reason}
                    </p>
                  )}
                  {result.available && selectedRoom && (
                    <p className="text-sm text-emerald-700/90 mt-1">
                      {selectedRoom.name} is free for this interval. No booking
                      data was changed.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <ExplainAvailability result={result} />

            {/* Info note */}
            <p className="text-xs text-slate-400 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Uses fictional sample data. The checker is read-only — it never
              creates or modifies bookings.
            </p>
            </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
