import type { Room, Booking } from './types';

export const SAMPLE_ROOMS: Room[] = [
  { id: 'r1', name: 'Theta Hall 101', building: 'Theta Hall', capacity: 40, blocked: false, equipment: ['Projector', 'Whiteboard', 'Microphone'] },
  { id: 'r2', name: 'Theta Hall 204', building: 'Theta Hall', capacity: 25, blocked: false, equipment: ['Whiteboard', 'TV Screen'] },
  { id: 'r3', name: 'Kepler Lab 3B', building: 'Kepler Center', capacity: 15, blocked: true, equipment: ['Lab Bench', 'Fume Hood', 'Projector'] },
  { id: 'r4', name: 'Nova Auditorium', building: 'Nova Wing', capacity: 200, blocked: false, equipment: ['Projector', 'Microphone', 'Stage Lighting', 'AV Console'] },
  { id: 'r5', name: 'Atlas Seminar 12', building: 'Atlas Block', capacity: 12, blocked: false, equipment: ['Whiteboard'] },
];

export const SAMPLE_BOOKINGS: Booking[] = [
  { id: 'b1', roomId: 'r1', title: 'Intro to Algorithms', start: 9 * 60, end: 10 * 60 + 30 },
  { id: 'b2', roomId: 'r1', title: 'Faculty Meeting', start: 14 * 60, end: 15 * 60 },
  { id: 'b3', roomId: 'r2', title: 'Design Studio', start: 11 * 60, end: 12 * 60 + 30 },
  { id: 'b4', roomId: 'r4', title: 'Guest Lecture: AI Ethics', start: 16 * 60, end: 17 * 60 + 30 },
  { id: 'b5', roomId: 'r5', title: 'PhD Seminar', start: 13 * 60, end: 14 * 60 },
  { id: 'b6', roomId: 'r5', title: 'Study Group', start: 15 * 60 + 30, end: 16 * 60 + 15 },
];

// "Current time" the app simulates so the demo always has sensible data.
// 10:30 AM = 630 minutes.
export const SAMPLE_CURRENT_TIME = 630;
