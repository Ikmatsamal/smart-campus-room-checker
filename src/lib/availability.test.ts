import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import type { Room, Booking } from './types';

function makeRoomOpen(): Room {
  return { id: 'room-open', name: 'Test Room A', building: 'Test Building', capacity: 30, blocked: false, equipment: ['Projector'] };
}

function makeRoomBlocked(): Room {
  return { id: 'room-blocked', name: 'Test Room B', building: 'Test Building', capacity: 20, blocked: true, equipment: [] };
}

function makeDefaultBookings(): Booking[] {
  return [{ id: 'bk-1', roomId: 'room-open', title: 'Existing Booking', start: 600, end: 660 }];
}

const DEFAULT_CURRENT_TIME = 540;

describe('checkAvailability', () => {
  // T01 – AC4: touching after the booking is allowed
  it('T01: 660-720 returns true (touching after booking)', () => {
    const result = checkAvailability({ start: 660, end: 720 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
  });

  // T02 – AC1: start must be strictly after currentTime
  it('T02: 540-570 returns false (starts exactly now)', () => {
    const result = checkAvailability({ start: 540, end: 570 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T03 – AC1: zero duration is invalid
  it('T03: 720-720 returns false (zero duration)', () => {
    const result = checkAvailability({ start: 720, end: 720 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T04 – AC1: reversed interval is invalid
  it('T04: 750-720 returns false (reversed)', () => {
    const result = checkAvailability({ start: 750, end: 720 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T05 – AC1: end past 1440 is invalid
  it('T05: 1380-1441 returns false (past end of day)', () => {
    const result = checkAvailability({ start: 1380, end: 1441 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T06 – AC2: exactly 120 min is allowed
  it('T06: 720-840 returns true (exactly 120 min)', () => {
    const result = checkAvailability({ start: 720, end: 840 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
  });

  // T07 – AC2: 121 min exceeds limit
  it('T07: 720-841 returns false (121 min)', () => {
    const result = checkAvailability({ start: 720, end: 841 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T08 – AC4: touching before the booking is allowed
  it('T08: 570-600 returns true (touching before booking)', () => {
    const result = checkAvailability({ start: 570, end: 600 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
  });

  // T09 – AC4: partial overlap with booking
  it('T09: 630-690 returns false (partial overlap)', () => {
    const result = checkAvailability({ start: 630, end: 690 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T10 – AC4: candidate contains the booking
  it('T10: 570-690 returns false (contains booking)', () => {
    const result = checkAvailability({ start: 570, end: 690 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T11 – AC4: candidate inside the booking
  it('T11: 615-645 returns false (inside booking)', () => {
    const result = checkAvailability({ start: 615, end: 645 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T12 – AC4: identical to the booking
  it('T12: 600-660 returns false (identical)', () => {
    const result = checkAvailability({ start: 600, end: 660 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T13 – AC3: blocked room is always unavailable
  it('T13: 660-720 on blocked room returns false', () => {
    const result = checkAvailability({ start: 660, end: 720 }, makeRoomBlocked(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });

  // T14 – AC4: no bookings means available
  it('T14: 630-690 with empty bookings returns true', () => {
    const result = checkAvailability({ start: 630, end: 690 }, makeRoomOpen(), [], DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
  });

  // T15 – data preservation: bookings array is not mutated
  it('T15: bookings are unchanged after a call (data preservation)', () => {
    const bookings = makeDefaultBookings();
    const before = JSON.stringify(bookings);
    checkAvailability({ start: 630, end: 690 }, makeRoomOpen(), bookings, DEFAULT_CURRENT_TIME);
    expect(JSON.stringify(bookings)).toBe(before);
  });

  // T16 – AC4: bookings for other rooms must not block
  it('T16: 630-690 in room-open, only booking belongs to room-other, returns true', () => {
    const bookings: Booking[] = [{ id: 'bk-x', roomId: 'room-other', title: 'Other Room Booking', start: 600, end: 660 }];
    const result = checkAvailability({ start: 630, end: 690 }, makeRoomOpen(), bookings, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
  });

  // T17 – AC2: 120 min ending exactly at midnight is allowed
  it('T17: 1320-1440 returns true (120 min, ends at midnight)', () => {
    const result = checkAvailability({ start: 1320, end: 1440 }, makeRoomOpen(), makeDefaultBookings(), DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
  });

    it('T18: 541-601 returns true (starts one minute after now)', () => {
    const room = { id: 'room-open', name: 'Test Room A', building: 'Test Building', capacity: 30, blocked: false, equipment: ['Projector'] };
    const bookings = [
      { id: 'bk-1', roomId: 'room-open', title: 'Existing Booking', start: 600, end: 660 },
    ];
    // 541-601 overlaps the 600-660 booking by one minute, so use an empty list here:
    const result = checkAvailability({ start: 541, end: 601 }, room, [], 540);
    expect(result.available).toBe(true);
    expect(bookings).toHaveLength(1);
  });

  it('T19: 570-601 returns false (overlaps booking by one minute)', () => {
    const room = { id: 'room-open', name: 'Test Room A', building: 'Test Building', capacity: 30, blocked: false, equipment: ['Projector'] };
    const bookings = [
      { id: 'bk-1', roomId: 'room-open', title: 'Existing Booking', start: 600, end: 660 },
    ];
    const result = checkAvailability({ start: 570, end: 601 }, room, bookings, 540);
    expect(result.available).toBe(false);
  });
});
