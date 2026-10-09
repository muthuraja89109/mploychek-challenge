import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { LatencyService } from './latency.service';
import { User, UserInput } from './models';

/** All user-related API calls live here. Components never touch HttpClient directly. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private latency = inject(LatencyService);

  me(): Observable<User> {
    return this.http.get<User>(`${API_URL}/users/me`, { params: this.latency.params(1) });
  }

  list(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users`, { params: this.latency.params(1) });
  }

  create(body: UserInput): Observable<User> {
    return this.http.post<User>(`${API_URL}/users`, body, { params: this.latency.params(1) });
  }

  update(id: string, body: Partial<UserInput>): Observable<User> {
    return this.http.put<User>(`${API_URL}/users/${id}`, body, { params: this.latency.params(1) });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/users/${id}`, { params: this.latency.params(1) });
  }
}
