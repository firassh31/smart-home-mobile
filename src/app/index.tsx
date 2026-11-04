import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function IndexRoute() {
  const { ready, session } = useAuth();
  useEffect(() => {
    if (ready) router.replace(session ? '/dashboard' : '/login');
  }, [ready, session]);
  return <View style={styles.loading}><ActivityIndicator color={colors.green} /></View>;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.page } });
