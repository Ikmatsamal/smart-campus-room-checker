import type { Booking, Interval, Room, AvailabilityResult } from './types';

export const MAX_BOOKING_MINUTES = 120;
export const MINUTES_PER_DAY = 1440;

/** Return only the bookings belonging to the given room. */
export function getRoomBookings(roomId: string, bookings: Booking[]): Booking[] {
  return bookings.filter((b) => b.roomId === roomId);
}

/**
 * Overlap test. Touching endpoints are allowed, so adjacent intervals
 * (one ends at 600, the other starts at 600) do NOT count as overlapping.
 */
export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function checkAvailability(
  candidate: Interval,
  room: Room | undefined,
  bookings: Booking[],
  currentTime: number,
): AvailabilityResult {
  if (!room) {
    return { available: false, reason: 'Please select a room.' };
  }

  const { start, end } = candidate;

  // AC1: valid interval bounds and start after current time.
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    end > MINUTES_PER_DAY ||
    start >= end
  ) {
    return {
      available: false,
      reason:
        'Start and end must form a valid interval: 0 ≤ start < end ≤ 1440.',
    };
  }

  if (start <= currentTime) {
    return {
      available: false,
      reason: 'Start time must be after the current time.',
    };
  }

  // AC2: max 120 minutes.
  if (end - start > MAX_BOOKING_MINUTES) {
    return {
      available: false,
      reason: 'Bookings cannot be longer than 120 minutes.',
    };
  }

    

  // AC3: blocked room cannot be booked.
  if (room.blocked) {
    return {
      available: false,
      reason: 'This room is blocked and cannot be booked.',
    };
  }

  

  // AC4: overlap with existing bookings (touching endpoints allowed).
  const roomBookings = getRoomBookings(room.id, bookings);
  const conflicting = roomBookings.find((b) =>
    intervalsOverlap(candidate, { start: b.start, end: b.end }),
  );

  if (conflicting) {
    return {
      available: false,
      reason: `Overlaps with existing booking "${conflicting.title}" (${fmtTime(conflicting.start)}–${fmtTime(conflicting.end)}).`,
    };
  }

  return { available: true };
}

export function fmtTime(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Convert an "HH:MM" string to minutes from midnight, or NaN if malformed. */
export function parseTimeInput(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const h = Number(match[1]);
  const mm = Number(match[2]);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return NaN;
  return h * 60 + mm;
}
