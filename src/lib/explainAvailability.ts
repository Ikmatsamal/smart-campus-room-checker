import type { AvailabilityResult } from './types';

/** Test control: when true, the mock adapter throws so the fallback path runs. */
let simulateFailure = false;

export function setSimulateAdapterFailure(value: boolean): void {
  simulateFailure = value;
}

/**
 * Mock AI adapter. Builds a short explanation purely from the
 * checkAvailability result (available + reason). It never re-evaluates
 * availability, reads bookings, or performs any network call.
 */
export function explainAvailability(result: AvailabilityResult): string {
  if (simulateFailure) {
    throw new Error('Simulated adapter failure');
  }
  if (result.available) {
    return 'All scheduling checks passed for this interval, so the room is free to book.';
  }
  return `The checker could not confirm this interval because: ${result.reason} Adjust the times or pick another room to resolve this.`;
}
