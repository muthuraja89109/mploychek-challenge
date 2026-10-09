import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, startWith, switchMap, tap } from 'rxjs';
import { ActivityService } from '../../core/activity.service';
import { LATENCY_OPTIONS, LatencyService } from '../../core/latency.service';
import { toLoadState } from '../../core/load-state';
import { LoadState, RecordRow, RecordStatus, RecordsResponse, User } from '../../core/models';
import { RecordsService } from '../../core/records.service';
import { UserService } from '../../core/user.service';
import { RoleBadgeComponent } from '../../shared/role-badge.component';

type SortKey = 'reference' | 'candidate' | 'check' | 'status' | 'accessLevel' | 'updatedOn';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RoleBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private users = inject(UserService);
  private recordsApi = inject(RecordsService);
  protected latency = inject(LatencyService);
  protected activity = inject(ActivityService);

  protected latencyOptions = LATENCY_OPTIONS;
  protected skeletonRows = [0, 1, 2, 3, 4];

  // ---- Async state: one signal per section, so each fills in on its own ----
  protected profile = signal<LoadState<User>>({ status: 'loading' });
  protected records = signal<LoadState<RecordsResponse>>({ status: 'loading' });

  // Emits whenever we want to (re)load. startWith() triggers the first load.
  private reload$ = new Subject<void>();

  constructor() {
    // Two INDEPENDENT pipelines. They run in parallel, and with a delay set,
    // the profile card appears first and the (slower) table appears later.
    // switchMap cancels an older request if a newer reload starts.
    this.reload$
      .pipe(
        startWith(undefined),
        tap(() => this.profile.set({ status: 'loading' })),
        switchMap(() => this.users.me().pipe(toLoadState())),
        takeUntilDestroyed()
      )
      .subscribe((state) => this.profile.set(state));

    this.reload$
      .pipe(
        startWith(undefined),
        tap(() => this.records.set({ status: 'loading' })),
        switchMap(() => this.recordsApi.list().pipe(toLoadState())),
        takeUntilDestroyed()
      )
      .subscribe((state) => {
        this.records.set(state);
        this.page.set(0);
      });
  }

  protected reload() {
    this.reload$.next();
  }

  protected setLatency(ms: number) {
    this.latency.set(ms);
    this.reload();
  }

  // ---- Table controls (signals + computed = no manual syncing) ----
  protected query = signal('');
  protected statusFilter = signal<'All' | RecordStatus>('All');
  protected sortKey = signal<SortKey>('updatedOn');
  protected sortDir = signal<'asc' | 'desc'>('desc');
  protected page = signal(0);
  protected readonly pageSize = 5;
  protected statuses: ('All' | RecordStatus)[] = ['All', 'Verified', 'In progress', 'Flagged'];

  protected level = computed(() => {
    const p = this.profile();
    return p.status === 'ready' && p.data.role === 'Admin' ? 3 : 1;
  });

  /** Filter -> sort. Recomputed only when one of the signals it reads changes. */
  protected filtered = computed<RecordRow[]>(() => {
    const state = this.records();
    if (state.status !== 'ready') return [];

    const q = this.query().trim().toLowerCase();
    const status = this.statusFilter();
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;

    return state.data.records
      .filter((r) => status === 'All' || r.status === status)
      .filter((r) => !q || `${r.reference} ${r.candidate} ${r.check}`.toLowerCase().includes(q))
      .sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir);
  });

  protected pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  protected pageRows = computed(() => {
    const start = this.page() * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  /** How many black "redaction bars" to draw for records the user cannot open. */
  protected redactions = computed(() => {
    const s = this.records();
    return s.status === 'ready' ? Array.from({ length: Math.min(s.data.hidden, 3) }) : [];
  });

  protected sortBy(key: SortKey) {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  protected ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  protected onQuery(value: string) {
    this.query.set(value);
    this.page.set(0);
  }

  protected onStatus(value: 'All' | RecordStatus) {
    this.statusFilter.set(value);
    this.page.set(0);
  }

  protected clearFilters() {
    this.query.set('');
    this.statusFilter.set('All');
    this.page.set(0);
  }

  protected pillClass(s: RecordStatus) {
    return s === 'Verified' ? 'pill-verified' : s === 'Flagged' ? 'pill-flagged' : 'pill-progress';
  }
}
