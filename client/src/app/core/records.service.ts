import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { LatencyService } from './latency.service';
import { RecordsResponse } from './models';

@Injectable({ providedIn: 'root' })
export class RecordsService {
  private http = inject(HttpClient);
  private latency = inject(LatencyService);

  /** Records are made 2x slower than the profile call, so the two visibly finish at different times. */
  list(): Observable<RecordsResponse> {
    return this.http.get<RecordsResponse>(`${API_URL}/records`, { params: this.latency.params(2) });
  }
}
