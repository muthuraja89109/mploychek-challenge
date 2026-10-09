import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { ActivityService } from './activity.service';
import { API_URL } from './api';

/** Records when each API call starts and how long it took. */
export const activityInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_URL)) return next(req);

  const activity = inject(ActivityService);
  const path = req.url.slice(API_URL.length);
  const id = activity.start(`${req.method} ${path}`);

  return next(req).pipe(
    tap({
      next: (event) => event.type === HttpEventType.Response && activity.finish(id, 'ok'),
      error: () => activity.finish(id, 'failed'),
    }),
    // If the request was cancelled (e.g. a newer one replaced it), mark it so.
    finalize(() => activity.finish(id, 'cancelled'))
  );
};
