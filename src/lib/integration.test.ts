import { describe, it, expect } from 'vitest';
import { SAMPLE_ROOMS, SAMPLE_BOOKINGS, SAMPLE_CURRENT_TIME } from './sampleData';
import { filterRooms } from './filterRooms';
import { getRoomBookings, checkAvailability } from './availability';
import type { Interval } from './types';

const maxCapacity = Math.max(...SAMPLE_ROOMS.map((r) => r.capacity));

describe('integration', () => {
  it('I1: attendees larger than biggest capacity returns [] (F4)', () => {
    expect(filterRooms(SAMPLE_ROOMS, { attendees: maxCapacity + 1, equipment: [] })).toEqual([]);
  });

  it('I2: exact capacity includes, capacity+1 excludes (F1 boundary)', () => {
    const room = SAMPLE_ROOMS.find((r) => r.id === 'r5')!;
    expect(room.capacity).toBe(12);
    const exact = filterRooms(SAMPLE_ROOMS, { attendees: room.capacity, equipment: [] }).map((r) => r.id);
    expect(exact).toContain(room.id);
    const over = filterRooms(SAMPLE_ROOMS, { attendees: room.capacity + 1, equipment: [] }).map((r) => r.id);
    expect(over).not.toContain(room.id);
  });

  it('I3: nonexistent equipment excludes all; existing equipment present in every result (F2)', () => {
    expect(filterRooms(SAMPLE_ROOMS, { attendees: 0, equipment: ['Hoverboard'] })).toEqual([]);
    const matches = filterRooms(SAMPLE_ROOMS, { attendees: 0, equipment: ['Projector'] });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((r) => r.equipment.includes('Projector'))).toBe(true);
  });

  it('I4: same interval unavailable in one open room, available in another (F5)', () => {
    // r1 has a booking 14:00-15:00; pick an interval overlapping it.
    const candidate: Interval = { start: 14 * 60 + 15, end: 14 * 60 + 60 };
    const r1 = SAMPLE_ROOMS.find((r) => r.id === 'r1')!;
    const r2 = SAMPLE_ROOMS.find((r) => r.id === 'r2')!;
    expect(r1.blocked).toBe(false);
    expect(r2.blocked).toBe(false);
    const r1Result = checkAvailability(candidate, r1, getRoomBookings(r1.id, SAMPLE_BOOKINGS), SAMPLE_CURRENT_TIME);
    expect(r1Result.available).toBe(false);
    const r2Result = checkAvailability(candidate, r2, getRoomBookings(r2.id, SAMPLE_BOOKINGS), SAMPLE_CURRENT_TIME);
    expect(r2Result.available).toBe(true);
  });

  it('I5: blocked room stays in filterRooms but checkAvailability is unavailable (F3)', () => {
    const blocked = SAMPLE_ROOMS.find((r) => r.blocked)!;
    const candidate: Interval = { start: 16 * 60, end: 16 * 60 + 30 };
    const matches = filterRooms(SAMPLE_ROOMS, { attendees: 0, equipment: [] }).map((r) => r.id);
    expect(matches).toContain(blocked.id);
    const result = checkAvailability(candidate, blocked, getRoomBookings(blocked.id, SAMPLE_BOOKINGS), SAMPLE_CURRENT_TIME);
    expect(result.available).toBe(false);
  });

  it('I6: bookings are deep-equal to a pre-run copy (AC5)', () => {
    const before = JSON.parse(JSON.stringify(SAMPLE_BOOKINGS));
    // Re-run the pipeline exercised in I4 and I5.
    const candidate: Interval = { start: 14 * 60 + 15, end: 14 * 60 + 60 };
    const r1 = SAMPLE_ROOMS.find((r) => r.id === 'r1')!;
    checkAvailability(candidate, r1, getRoomBookings(r1.id, SAMPLE_BOOKINGS), SAMPLE_CURRENT_TIME);
    const blocked = SAMPLE_ROOMS.find((r) => r.blocked)!;
    checkAvailability({ start: 16 * 60, end: 16 * 60 + 30 }, blocked, getRoomBookings(blocked.id, SAMPLE_BOOKINGS), SAMPLE_CURRENT_TIME);
    expect(JSON.parse(JSON.stringify(SAMPLE_BOOKINGS))).toEqual(before);
  });
});
