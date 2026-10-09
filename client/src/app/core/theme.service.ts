import { Injectable, effect, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.initial());

  constructor() {
    // An effect re-runs whenever a signal it reads changes.
    effect(() => {
      const t = this.theme();
      document.documentElement.dataset['theme'] = t;
      localStorage.setItem('mploychek.theme', t);
    });
  }

  toggle() {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  private initial(): Theme {
    const saved = localStorage.getItem('mploychek.theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
