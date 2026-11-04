import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/constants/colors';
import type { Device } from '@/types/smart-home';

const typeDetails: Record<string, { label: string; icon: string }> = {
  light: { label: 'Light', icon: '☼' },
  ac: { label: 'AC', icon: '❄' },
  doorlock: { label: 'Door Lock', icon: '⌑' },
};

type Props = { device: Device; parent: boolean; onOpen: () => void; onToggle: () => void; onEdit: () => void; onDelete: () => void };

export function DeviceCard({ device, parent, onOpen, onToggle, onEdit, onDelete }: Props) {
  const isOn = device.status === 'on';
  const detail = typeDetails[device.type] || { label: 'Device', icon: '⌂' };

  return (
    <View style={styles.card}>
      <Pressable style={styles.main} onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Open ${device.name} settings`}>
        <View style={styles.icon}><Text style={styles.iconText}>{detail.label}</Text></View>
        <View style={styles.copy}>
          <Text numberOfLines={2} style={styles.name}>{device.name}</Text>
          <Text numberOfLines={1} style={styles.room}>{device.room || 'Unassigned'}</Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Text style={[styles.status, isOn && styles.statusOn]}>{isOn ? 'ON' : 'OFF'}</Text>
        <View style={styles.actionRight}>
          {parent && <>
            <Pressable onPress={onEdit} style={styles.action}><Text style={styles.actionText}>Edit</Text></Pressable>
            <Pressable onPress={onDelete} style={styles.action}><Text style={[styles.actionText, styles.deleteText]}>Delete</Text></Pressable>
          </>}
          <Pressable onPress={onToggle} accessibilityRole="switch" accessibilityState={{ checked: isOn }} accessibilityLabel={`${isOn ? 'Turn off' : 'Turn on'} ${device.name}`} style={[styles.power, isOn && styles.powerOn]}>
            <View style={[styles.powerKnob, isOn && styles.powerKnobOn]} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '48%', minHeight: 196, padding: 16, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: colors.tan, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', elevation: 3 },
  main: { flex: 1, minWidth: 0, alignItems: 'flex-start' },
  icon: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.72)', marginBottom: 15 },
  iconText: { color: colors.green, fontFamily: font.bold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  copy: { width: '100%' },
  name: { color: colors.ink, fontFamily: font.bold, fontSize: 15, lineHeight: 19 },
  room: { color: colors.muted, fontFamily: font.regular, fontSize: 11, marginTop: 5 },
  status: { color: colors.red, fontFamily: font.bold, fontSize: 10, letterSpacing: 0.4 },
  statusOn: { color: colors.green },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 3, marginTop: 12 },
  actionRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  action: { paddingHorizontal: 4, paddingVertical: 8 },
  actionText: { color: colors.muted, fontFamily: font.bold, fontSize: 9 },
  deleteText: { color: colors.red },
  power: { width: 46, height: 28, borderRadius: 15, backgroundColor: colors.red, padding: 3, justifyContent: 'center' },
  powerOn: { backgroundColor: colors.green },
  powerKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.paper },
  powerKnobOn: { alignSelf: 'flex-end' },
});
