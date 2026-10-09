import { HttpErrorResponse } from '@angular/common/http';
import { Observable, OperatorFunction, catchError, map, of } from 'rxjs';
import { LoadState } from './models';

/** Turns any HTTP failure into a sentence a person can act on. */
export function httpErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Check that the API is running.';
    if (err.error?.message) return err.error.message;
  }
  return 'Something went wrong. Please try again.';
}

/**
 * Custom RxJS operator: converts a stream of data into a stream of LoadState.
 *   source$.pipe(toLoadState())  ->  { status: 'ready', data }  or  { status: 'error', message }
 */
export function toLoadState<T>(): OperatorFunction<T, LoadState<T>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((data): LoadState<T> => ({ status: 'ready', data })),
      catchError((err) => of<LoadState<T>>({ status: 'error', message: httpErrorMessage(err) }))
    );
}
