import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { AuthForm } from '@/features/auth/AuthForm';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginRoute() {
  const { ready, session } = useAuth();
  useEffect(() => { if (ready && session) router.replace('/dashboard'); }, [ready, session]);
  return <AuthForm variant="login" />;
}
