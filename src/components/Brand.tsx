import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/constants/colors';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.row, compact && styles.compact]}>
      <View style={[styles.mark, compact && styles.smallMark]}><Text style={[styles.markText, compact && styles.smallMarkText]}>MS</Text></View>
      <Text style={[styles.name, compact && styles.smallName]}>MSHome</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 26 },
  compact: { justifyContent: 'flex-start', marginBottom: 0 },
  mark: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  smallMark: { width: 30, height: 30 },
  markText: { color: colors.paper, fontFamily: font.bold, fontSize: 13 },
  smallMarkText: { fontSize: 10 },
  name: { color: colors.ink, fontFamily: font.bold, fontSize: 20 },
  smallName: { fontSize: 17 },
});
