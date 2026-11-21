import type { Room } from './types';

export interface FilterCriteria {
  attendees: number;
  equipment: string[];
}

/**
 * Filter rooms by capacity (F1) and equipment (F2) only.
 * Blocked rooms are NOT excluded here — F3 is enforced by checkAvailability.
 */
export function filterRooms(rooms: Room[], criteria: FilterCriteria): Room[] {
  const { attendees, equipment } = criteria;
  return rooms.filter(
    (room) =>
      room.capacity >= attendees &&
      equipment.every((item) => room.equipment.includes(item)),
  );
}
