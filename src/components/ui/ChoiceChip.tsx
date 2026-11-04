import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font } from '@/constants/colors';

export function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 40, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: 22 },
  selected: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  text: { color: colors.muted, fontFamily: font.regular, fontSize: 13 },
  selectedText: { color: colors.green, fontFamily: font.bold },
});
