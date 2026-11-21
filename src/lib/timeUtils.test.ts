import { describe, it, expect } from 'vitest';
import { parseTimeInput, fmtTime } from './availability';

describe('parseTimeInput', () => {
  it('P1: parses a normal HH:MM value', () => {
    expect(parseTimeInput('09:30')).toBe(570);
  });

  it('P2: accepts a one-digit hour', () => {
    expect(parseTimeInput('9:30')).toBe(570);
  });

  it('P3: midnight and the last minute of the day', () => {
    expect(parseTimeInput('00:00')).toBe(0);
    expect(parseTimeInput('23:59')).toBe(1439);
  });

  it('P4: trims surrounding spaces', () => {
    expect(parseTimeInput(' 10:15 ')).toBe(615);
  });

  it('P5: rejects hour 24 and minute 60', () => {
    expect(parseTimeInput('24:00')).toBeNaN();
    expect(parseTimeInput('12:60')).toBeNaN();
  });

  it('P6: rejects malformed text', () => {
    expect(parseTimeInput('')).toBeNaN();
    expect(parseTimeInput('abc')).toBeNaN();
    expect(parseTimeInput('9:5')).toBeNaN();
  });
});

describe('fmtTime', () => {
  it('F1: pads hours and minutes', () => {
    expect(fmtTime(0)).toBe('00:00');
    expect(fmtTime(61)).toBe('01:01');
    expect(fmtTime(570)).toBe('09:30');
  });

  it('F2: last minute of the day', () => {
    expect(fmtTime(1439)).toBe('23:59');
  });

  it('F3: 1440 wraps to 00:00', () => {
    expect(fmtTime(1440)).toBe('00:00');
  });

  it('F4: negative values wrap backwards', () => {
    expect(fmtTime(-60)).toBe('23:00');
  });
});
