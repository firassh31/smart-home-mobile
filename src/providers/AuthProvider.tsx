import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { clearSession, readSession, writeSession } from '@/services/session-storage';
import type { AuthResponse, Session } from '@/types/smart-home';

type RegistrationData = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: Session['role'];
  familyCode: string;
};

type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyPhone: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    readSession().then((saved) => {
      if (active) setSession(saved);
    }).catch(() => {
      if (active) setSession(null);
    }).finally(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, []);

  const saveAuthResponse = useCallback(async (result: AuthResponse) => {
    const next: Session = {
      token: result.token,
      role: result.role,
      familyCode: result.familyCode || '',
      phoneVerified: result.isPhoneVerified === true,
    };
    await writeSession(next);
    setSession(next);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    await saveAuthResponse(await api.login(identifier, password));
  }, [saveAuthResponse]);

  // Registration intentionally does NOT persist the session: the account is
  // created, then the user confirms the SMS OTP, and verifyPhone stores the
  // fresh token. This keeps unverified phones out of saved sessions.
  const register = useCallback(async (data: RegistrationData) => {
    const { phoneNumber, ...rest } = data;
    await api.register({ ...rest, phone_number: phoneNumber });
    await api.sendOtp(phoneNumber).catch(() => {
      // The OTP screen offers a resend button, so a failed first send
      // should not abort an otherwise successful registration.
    });
  }, []);

  const sendOtp = useCallback(async (phoneNumber: string) => {
    await api.sendOtp(phoneNumber);
  }, []);

  const verifyPhone = useCallback(async (phoneNumber: string, otp: string) => {
    await saveAuthResponse(await api.verifyOtp(phoneNumber, otp));
  }, [saveAuthResponse]);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, ready, login, register, sendOtp, verifyPhone, logout }),
    [session, ready, login, register, sendOtp, verifyPhone, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
