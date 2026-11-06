import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font } from '@/constants/colors';

type Props = React.ComponentProps<typeof TextInput> & { label: string };

// Labeled text input; forwards every TextInput prop (keyboardType, secure...).
export function TextField({ label, style, ...props }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={[styles.input, style]} placeholderTextColor="#96918C" autoCorrect={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginTop: 18 },
  label: { color: colors.ink, fontFamily: font.bold, fontSize: 13, marginBottom: 8 },
  input: { height: 50, backgroundColor: colors.soft, borderColor: colors.line, borderWidth: 1, borderRadius: 11, paddingHorizontal: 14, fontFamily: font.regular, fontSize: 15, color: colors.ink },
});
