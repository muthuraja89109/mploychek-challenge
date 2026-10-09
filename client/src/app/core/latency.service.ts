import { Injectable, signal } from '@angular/core';

export const LATENCY_OPTIONS = [
  { label: 'Off', ms: 0 },
  { label: '1 s', ms: 1000 },
  { label: '3 s', ms: 3000 },
  { label: '6 s', ms: 6000 },
];

/**
 * Holds the "simulated API delay" the user picked.
 * Services read it and send it to the API as the ?delay= query parameter.
 */
@Injectable({ providedIn: 'root' })
export class LatencyService {
  readonly ms = signal(Number(sessionStorage.getItem('latency')) || 0);

  set(ms: number) {
    this.ms.set(ms);
    sessionStorage.setItem('latency', String(ms));
  }

  /** HTTP params for a request. "multiplier" lets one call be slower than another. */
  params(multiplier = 1): Record<string, string> {
    const delay = this.ms() * multiplier;
    return delay > 0 ? { delay: String(delay) } : {};
  }
}
