import type { AuthResponse, Device, DeviceDraft, DeviceType, Session } from '@/types/smart-home';

const API_URL = 'https://smart-home-server-j6ji.onrender.com';

async function request<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Could not reach MSHome. Check your internet connection and try again.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status}).`);
  }
  return payload as T;
}

export const api = {
  // `identifier` may be a username, email address, or phone number.
  login: (identifier: string, password: string) =>
    request<AuthResponse>('/auth/login', undefined, {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  register: (data: { name: string; email: string; phone_number: string; password: string; role: Session['role']; familyCode: string }) =>
    request<AuthResponse>('/auth/register', undefined, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendOtp: (phoneNumber: string) =>
    request<{ message: string }>('/auth/send-otp', undefined, {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    }),

  verifyOtp: (phoneNumber: string, otp: string) =>
    request<AuthResponse>('/auth/verify-otp', undefined, {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber, otp }),
    }),

  getDevices: (token: string) => request<Device[]>('/devices', token),
  getDeviceTypes: (token: string) => request<DeviceType[]>('/devices/types', token),

  createDevice: (token: string, draft: DeviceDraft) =>
    request<{ id: string; message: string }>('/devices', token, {
      method: 'POST',
      body: JSON.stringify(draft),
    }),

  updateDevice: (token: string, id: string, draft: DeviceDraft) =>
    request<{ message: string }>(`/devices/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(draft),
    }),

  deleteDevice: (token: string, id: string) =>
    request<{ message: string }>(`/devices/${id}`, token, { method: 'DELETE' }),

  setDeviceStatus: (token: string, id: string, status: Device['status']) =>
    request<{ message: string; status: Device['status'] }>(`/devices/${id}/status`, token, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  setDeviceState: (token: string, id: string, updates: NonNullable<Device['state']>) =>
    request<Device>(`/devices/${id}/state`, token, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  getWeather: () => request<{ main?: { temp?: number }; name?: string }>('/api/weather?city=Haifa'),
};
