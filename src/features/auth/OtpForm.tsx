import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { colors, font } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export function OtpForm({ phone }: { phone: string }) {
  const { sendOtp, verifyPhone } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  // Countdown until the resend button unlocks.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  // Auto-submit as soon as all six digits are entered.
  const onChangeCode = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(next);
    if (next.length === OTP_LENGTH && !busy) submit(next);
  };

  const submit = async (otp: string) => {
    if (otp.length !== OTP_LENGTH) return setNotice('Enter the 6-digit code from the SMS.');
    setBusy(true);
    setNotice('');
    try {
      await verifyPhone(phone, otp);
      router.replace('/dashboard');
    } catch (error) {
      setNotice((error as Error).message);
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0 || busy) return;
    setNotice('');
    try {
      await sendOtp(phone);
      setResendIn(RESEND_SECONDS);
      setNotice('A new code was sent via SMS.');
    } catch (error) {
      setNotice((error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Brand />
            <Text style={styles.title}>Verify Your Phone</Text>
            <Text style={styles.subtitle}>We sent a 6-digit code via SMS to {phone}.</Text>

            {/* One hidden input drives six display boxes: simplest reliable
                pattern for paste support and keyboard auto-advance. */}
            <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()}>
              {Array.from({ length: OTP_LENGTH }, (_, index) => (
                <View key={index} style={[styles.box, index === code.length && styles.boxActive]}>
                  <Text style={styles.boxText}>{code[index] ?? ''}</Text>
                </View>
              ))}
            </Pressable>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={onChangeCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={OTP_LENGTH}
              autoFocus
            />

            <Button title={busy ? 'Verifying…' : 'Verify Code'} onPress={() => submit(code)} disabled={busy} />
            <View style={styles.footer}>
              <Text style={styles.footerText}>{"Didn't get it? "}</Text>
              <Pressable onPress={resend} disabled={resendIn > 0}>
                <Text style={[styles.link, resendIn > 0 && styles.linkDisabled]}>
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </Text>
              </Pressable>
            </View>
            <Pressable onPress={() => router.replace('/login')}>
              <Text style={[styles.link, styles.backLink]}>Back to login</Text>
            </Pressable>
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
  boxes: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 24, marginBottom: 24 },
  box: { flex: 1, height: 56, backgroundColor: colors.soft, borderColor: colors.line, borderWidth: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  boxActive: { borderColor: colors.green, borderWidth: 2 },
  boxText: { color: colors.ink, fontFamily: font.bold, fontSize: 22 },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 23 },
  footerText: { color: colors.muted, fontFamily: font.regular, fontSize: 13 },
  link: { color: colors.green, fontFamily: font.bold, fontSize: 13 },
  linkDisabled: { color: colors.muted },
  backLink: { textAlign: 'center', marginTop: 14 },
});
