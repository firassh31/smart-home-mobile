import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { OtpForm } from '@/features/auth/OtpForm';

// Phone verification route: expects ?phone= from the registration step and
// bounces back to login when opened without it.
export default function VerifyOtpRoute() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  if (!phone) return <Redirect href="/login" />;
  return <OtpForm phone={phone} />;
}
