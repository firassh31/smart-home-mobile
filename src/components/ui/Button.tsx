import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font } from '@/constants/colors';

type Props = { title: string; onPress: () => void; secondary?: boolean; danger?: boolean; disabled?: boolean };

export function Button({ title, onPress, secondary, danger, disabled }: Props) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, danger && styles.danger, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
      <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 50, flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderRadius: 11, backgroundColor: colors.green },
  secondary: { backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line },
  danger: { backgroundColor: colors.red },
  text: { color: colors.paper, fontFamily: font.bold, fontSize: 15 },
  secondaryText: { color: colors.ink },
  disabled: { opacity: 0.56 },
  pressed: { opacity: 0.75 },
});
