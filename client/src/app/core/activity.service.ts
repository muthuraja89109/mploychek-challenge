import { Injectable, signal } from '@angular/core';

export interface ActivityEntry {
  id: number;
  label: string;
  startedAt: number;
  durationMs?: number;
  status: 'pending' | 'ok' | 'failed' | 'cancelled';
}

/** A tiny log of API calls, shown on the dashboard so async work is visible. */
@Injectable({ providedIn: 'root' })
export class ActivityService {
  private seq = 0;
  readonly entries = signal<ActivityEntry[]>([]);

  start(label: string): number {
    const id = ++this.seq;
    const entry: ActivityEntry = { id, label, startedAt: performance.now(), status: 'pending' };
    this.entries.update((list) => [entry, ...list].slice(0, 6));
    return id;
  }

  finish(id: number, status: 'ok' | 'failed' | 'cancelled') {
    this.entries.update((list) =>
      list.map((e) =>
        e.id === id && e.status === 'pending'
          ? { ...e, status, durationMs: Math.round(performance.now() - e.startedAt) }
          : e
      )
    );
  }
}
