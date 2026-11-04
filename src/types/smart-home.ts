export type UserRole = 'parent' | 'child';

export type Session = {
  token: string;
  role: UserRole;
  familyCode?: string;
  phoneVerified?: boolean;
};

export type DeviceType = {
  value: string;
  label: string;
};

export type DeviceState = {
  brightness?: number;
  temperature?: number;
  is_locked?: boolean;
};

export type Device = {
  id: string;
  name: string;
  room?: string;
  type: string;
  status: 'on' | 'off';
  state?: DeviceState;
  childAccess?: boolean;
};

export type AuthResponse = {
  token: string;
  role: UserRole;
  familyCode?: string;
  message: string;
  phone_number?: string;
  isPhoneVerified?: boolean;
};

export type DeviceDraft = {
  name: string;
  room: string;
  type: string;
  childAccess: boolean;
};
