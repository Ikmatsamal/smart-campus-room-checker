export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  equipment: string[];
}

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  start: number; // minutes from 00:00
  end: number; // minutes from 00:00
}

export interface Interval {
  start: number;
  end: number;
}

export type AvailabilityResult =
  | { available: true }
  | { available: false; reason: string };
