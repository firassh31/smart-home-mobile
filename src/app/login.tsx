import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { AuthForm } from '@/features/auth/AuthForm';
import { useAuth } from '@/providers/AuthProvider';

// Login route: shows the shared auth form; already-signed-in users skip ahead.
export default function LoginRoute() {
  const { ready, session } = useAuth();
  useEffect(() => { if (ready && session) router.replace('/dashboard'); }, [ready, session]);
  return <AuthForm variant="login" />;
}
