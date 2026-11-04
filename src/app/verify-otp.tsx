import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { OtpForm } from '@/features/auth/OtpForm';

export default function VerifyOtpRoute() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  if (!phone) return <Redirect href="/login" />;
  return <OtpForm phone={phone} />;
}
