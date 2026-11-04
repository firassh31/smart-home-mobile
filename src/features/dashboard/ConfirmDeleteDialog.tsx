import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors, font } from '@/constants/colors';

type Props = { deviceName?: string; visible: boolean; busy: boolean; onCancel: () => void; onConfirm: () => void };

export function ConfirmDeleteDialog({ deviceName, visible, busy, onCancel, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.shade}><View style={styles.dialog}>
        <Text style={styles.title}>Delete Device</Text>
        <Text style={styles.subtitle}>Delete {deviceName}? This action cannot be undone.</Text>
        <View style={styles.actions}><Button title="Cancel" secondary onPress={onCancel} /><Button title={busy ? 'Deleting…' : 'Delete'} danger disabled={busy} onPress={onConfirm} /></View>
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shade: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: 'rgba(18,18,18,0.42)' },
  dialog: { backgroundColor: colors.paper, borderRadius: 22, padding: 22 },
  title: { color: colors.ink, fontFamily: font.bold, fontSize: 21, marginBottom: 8 },
  subtitle: { color: colors.muted, fontFamily: font.regular, fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 15 },
});
