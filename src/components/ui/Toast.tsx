import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/constants/colors';

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <View accessibilityLiveRegion="polite" style={styles.toast}><Text style={styles.text}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', bottom: 25, left: 18, right: 18, backgroundColor: colors.ink, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', elevation: 8 },
  text: { color: colors.paper, fontFamily: font.regular, fontSize: 13 },
});
