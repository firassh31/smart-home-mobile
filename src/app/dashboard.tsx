import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { useAuth } from '@/providers/AuthProvider';

export default function DashboardRoute() {
  const { ready, session } = useAuth();
  useEffect(() => { if (ready && !session) router.replace('/login'); }, [ready, session]);
  return <DashboardScreen />;
}
