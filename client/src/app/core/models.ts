export type Role = 'General User' | 'Admin';
export const ROLES: Role[] = ['General User', 'Admin'];

export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  department: string;
  role: Role;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type RecordStatus = 'Verified' | 'In progress' | 'Flagged';

export interface RecordRow {
  id: string;
  reference: string;
  candidate: string;
  check: string;
  status: RecordStatus;
  accessLevel: 1 | 2 | 3;
  updatedOn: string;
}

export interface RecordsResponse {
  clearance: 1 | 2 | 3;
  total: number;
  hidden: number; // records that exist but are above the caller's clearance
  records: RecordRow[];
}

/** What the admin form sends to the API. */
export interface UserInput {
  userId?: string;
  name: string;
  email: string;
  department: string;
  role: Role;
  password?: string;
}

/**
 * Every async screen section is in exactly one of these three states.
 * The template just switches on "status" - no scattered loading flags.
 */
export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string };
