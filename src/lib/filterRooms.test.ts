import { describe, it, expect } from 'vitest';
import { filterRooms } from './filterRooms';
import type { Room } from './types';

function room(id: string, capacity: number, equipment: string[]): Room {
  return { id, name: id, building: 'B', capacity, blocked: false, equipment };
}

const ROOMS: Room[] = [
  room('small', 12, ['Whiteboard']),
  room('mid', 25, ['Projector', 'Whiteboard']),
  room('big', 200, ['Projector', 'Microphone', 'AV Console']),
];

describe('filterRooms', () => {
  // F1: capacity boundary
  it('F1a: exact capacity match is included', () => {
    expect(filterRooms(ROOMS, { attendees: 12, equipment: [] }).map((r) => r.id)).toContain('small');
  });

  it('F1b: one more than capacity is excluded', () => {
    const ids = filterRooms(ROOMS, { attendees: 13, equipment: [] }).map((r) => r.id);
    expect(ids).not.toContain('small');
    expect(ids).toContain('mid');
  });

  it('F1c: zero attendees keeps all rooms', () => {
    expect(filterRooms(ROOMS, { attendees: 0, equipment: [] })).toHaveLength(3);
  });

  // F2: equipment
  it('F2a: requested equipment that is a subset is included', () => {
    const ids = filterRooms(ROOMS, { attendees: 0, equipment: ['Projector'] }).map((r) => r.id);
    expect(ids).toEqual(['mid', 'big']);
  });

  it('F2b: missing one item excludes the room', () => {
    const ids = filterRooms(ROOMS, { attendees: 0, equipment: ['Projector', 'Microphone', 'Whiteboard'] }).map((r) => r.id);
    expect(ids).toEqual([]);
  });

  it('F2c: empty equipment selection excludes nothing', () => {
    expect(filterRooms(ROOMS, { attendees: 0, equipment: [] })).toHaveLength(3);
  });

  // Change B: blocked rooms are not hidden by filterRooms
  it('F3a: blocked rooms stay in results when capacity and equipment match', () => {
    const blocked: Room = { id: 'blk', name: 'blk', building: 'B', capacity: 30, blocked: true, equipment: ['Projector'] };
    const ids = filterRooms([...ROOMS, blocked], { attendees: 10, equipment: ['Projector'] }).map((r) => r.id);
    expect(ids).toContain('blk');
  });
});
