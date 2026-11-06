import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { AuthForm } from '@/features/auth/AuthForm';
import { useAuth } from '@/providers/AuthProvider';

// Registration route: shows the shared auth form in register mode; a stored
// session (set only after OTP verification) skips straight to the dashboard.
export default function RegisterRoute() {
  const { ready, session } = useAuth();
  useEffect(() => { if (ready && session) router.replace('/dashboard'); }, [ready, session]);
  return <AuthForm variant="register" />;
}
