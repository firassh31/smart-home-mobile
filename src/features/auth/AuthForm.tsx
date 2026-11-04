import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/ui/Button';
import { ChoiceChip } from '@/components/ui/ChoiceChip';
import { TextField } from '@/components/ui/TextField';
import { Toast } from '@/components/ui/Toast';
import { colors, font } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import type { UserRole } from '@/types/smart-home';

export function AuthForm({ variant }: { variant: 'login' | 'register' }) {
  const isLogin = variant === 'login';
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [familyCode, setFamilyCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const submit = async () => {
    const phoneNumber = phone.replace(/[\s\-().]/g, '');
    if (!username.trim() || !password) return setNotice(isLogin ? 'Enter your username, email, or phone and your password.' : 'Enter your username and password.');
    if (!isLogin && (!email.trim() || password.length < 6)) return setNotice('Enter an email and a password with at least 6 characters.');
    if (!isLogin && !/^\+?[0-9]{7,15}$/.test(phoneNumber)) return setNotice('Enter a valid phone number, e.g. +972501234567.');
    if (!isLogin && role === 'child' && !familyCode.trim()) return setNotice('Child accounts need a family invite code.');

    setBusy(true);
    setNotice('');
    try {
      if (isLogin) {
        await login(username.trim(), password);
        router.replace('/dashboard');
      } else {
        await register({ name: username.trim(), email: email.trim(), phoneNumber, password, role, familyCode: familyCode.trim().toUpperCase() });
        // The session is stored only after the SMS code is confirmed.
        router.replace({ pathname: '/verify-otp', params: { phone: phoneNumber } });
      }
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Brand />
            <Text style={styles.title}>{isLogin ? 'Login' : 'Create Account'}</Text>
            <Text style={styles.subtitle}>{isLogin ? 'Manage your smart devices securely.' : 'Join your smart home family.'}</Text>

            <TextField label={isLogin ? 'Username, Email or Phone' : 'Username'} value={username} onChangeText={setUsername} placeholder={isLogin ? 'e.g. john@mshome.com' : 'e.g. John Doe'} autoCapitalize="none" returnKeyType="next" />
            {!isLogin && <TextField label="Email Address" value={email} onChangeText={setEmail} placeholder="e.g. john@mshome.com" keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />}
            {!isLogin && <TextField label="Phone Number" value={phone} onChangeText={setPhone} placeholder="e.g. +972501234567" keyboardType="phone-pad" autoCapitalize="none" returnKeyType="next" />}
            {!isLogin && <View style={styles.roleGroup}>
              <Text style={styles.label}>Account Type</Text>
              <View style={styles.roleOptions}>
                <ChoiceChip label="Parent · Full Access" selected={role === 'parent'} onPress={() => setRole('parent')} />
                <ChoiceChip label="Child · Restricted" selected={role === 'child'} onPress={() => setRole('child')} />
              </View>
            </View>}
            {!isLogin && role === 'child' && <TextField label="Family Invite Code" value={familyCode} onChangeText={setFamilyCode} placeholder="e.g. X7B9Q2" autoCapitalize="characters" returnKeyType="next" />}
            <TextField label="Password" value={password} onChangeText={setPassword} placeholder={isLogin ? 'Your password' : 'Minimum 6 characters'} secureTextEntry returnKeyType="done" onSubmitEditing={submit} />
            <Button title={busy ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'} onPress={submit} disabled={busy} />
            <View style={styles.footer}>
              <Text style={styles.footerText}>{isLogin ? "Don't have an account? " : 'Already have an account? '}</Text>
              <Pressable onPress={() => router.replace(isLogin ? '/register' : '/login')}>
                <Text style={styles.link}>{isLogin ? 'Register here' : 'Log in here'}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast message={notice} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.page },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  card: { backgroundColor: colors.paper, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.line },
  title: { color: colors.ink, fontFamily: font.bold, fontSize: 25, marginBottom: 6 },
  subtitle: { color: colors.muted, fontFamily: font.regular, fontSize: 14, lineHeight: 21 },
  label: { color: colors.ink, fontFamily: font.bold, fontSize: 13, marginBottom: 8 },
  roleGroup: { marginTop: 18 },
  roleOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 23, paddingVertical: 6 },
  footerText: { color: colors.muted, fontFamily: font.regular, fontSize: 13 },
  link: { color: colors.green, fontFamily: font.bold, fontSize: 13 },
});
