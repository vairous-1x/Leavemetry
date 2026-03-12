const API = 'http://localhost:5000/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as object),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>('/auth/me'),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyResetCode: (email: string, code: string) =>
    request<{ message: string; tempToken: string }>('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),
  resetPassword: (tempToken: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ tempToken, newPassword }),
    }),
};

export const usersApi = {
  list: () => request<User[]>('/users'),
  get: (id: string) => request<User>(`/users/${id}`),
  create: (body: { username: string; email: string; password: string; position?: string; department?: string }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<User> & { password?: string }) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
};

export const leavesApi = {
  list: () => request<Leave[]>('/leaves'),
  create: (body: { type: string; description?: string; from: string; to: string }) =>
    request<Leave>('/leaves', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: string, status: 'approved' | 'rejected', rejectionReason?: string) =>
    request<Leave>(`/leaves/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    }),
};

export const holidaysApi = {
  list: (year?: number) => request<Holiday[]>(`/holidays${year ? `?year=${year}` : ''}`),
  create: (body: { name: string; from: string; to: string; type?: string; comment?: string }) =>
    request<Holiday>('/holidays', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Holiday>) =>
    request<Holiday>(`/holidays/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<{ message: string }>(`/holidays/${id}`, { method: 'DELETE' }),
};

export const statsApi = {
  dashboard: () => request<DashboardStats | EmployeeBalance>('/stats/dashboard'),
  byMonth: (year?: number) =>
    request<{ year: number; byMonth: { month: number; approved: number; rejected: number; pending: number }[] }>(
      `/stats/by-month${year ? `?year=${year}` : ''}`
    ),
};

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'employee';
  position?: string;
  department?: string;
}

export interface Leave {
  _id: string;
  user: User | string;
  type: string;
  description?: string;
  from: string;
  to: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface Holiday {
  _id: string;
  name: string;
  from: string;
  to: string;
  type?: string;
  comment?: string;
}

export interface DashboardStats {
  employeeInVacation: number;
  employeeInOffice: number;
  totalLeaveRequested: number;
  pendingLeaves: number;
  lastLeaves: Leave[];
}

export interface EmployeeBalance {
  sickLeave: { used: number; total: number };
  vacationLeave: { used: number; total: number };
  personalLeave: { used: number; total: number };
}
