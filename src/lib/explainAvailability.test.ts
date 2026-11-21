import { describe, it, expect, afterEach } from 'vitest';
import { explainAvailability, setSimulateAdapterFailure } from './explainAvailability';
import type { AvailabilityResult } from './types';

function makeAvailable(): AvailabilityResult {
  return { available: true };
}

function makeUnavailable(reason: string): AvailabilityResult {
  return { available: false, reason };
}

afterEach(() => {
  setSimulateAdapterFailure(false);
});

describe('explainAvailability', () => {
  // E1 – F-AC2: available result gets a positive explanation
  it('E1: available result gives a positive explanation', () => {
    const text = explainAvailability(makeAvailable());
    expect(text.length).toBeGreaterThan(0);
    expect(text.toLowerCase()).toMatch(/free to book|available/);
  });

  // E2 – F-AC2: unavailable result quotes the original reason verbatim
  it('E2: unavailable result contains the original reason verbatim', () => {
    const reason = 'Room is blocked.';
    const text = explainAvailability(makeUnavailable(reason));
    expect(text).toContain(reason);
  });

  // E3 – F-AC4: simulate failure makes the adapter throw
  it('E3: with simulate failure on, explainAvailability throws', () => {
    setSimulateAdapterFailure(true);
    expect(() => explainAvailability(makeAvailable())).toThrow();
    expect(() => explainAvailability(makeUnavailable('Any reason.'))).toThrow();
  });

  // E4 – F-AC4: turning simulate failure off restores normal behavior
  it('E4: after turning simulate failure off, it works again', () => {
    setSimulateAdapterFailure(true);
    expect(() => explainAvailability(makeAvailable())).toThrow();
    setSimulateAdapterFailure(false);
    expect(() => explainAvailability(makeAvailable())).not.toThrow();
    expect(explainAvailability(makeAvailable()).length).toBeGreaterThan(0);
  });

  // E5 – project memory: explanation is at most 2 sentences
  it('E5: the explanation is at most 2 sentences', () => {
    const available = explainAvailability(makeAvailable());
    const unavailable = explainAvailability(
      makeUnavailable('Overlaps an existing booking from 10:00 to 11:00.'),
    );
    for (const text of [available, unavailable]) {
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      expect(sentences.length).toBeLessThanOrEqual(2);
    }
  });
});
