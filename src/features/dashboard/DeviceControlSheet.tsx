import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ChoiceChip } from '@/components/ui/ChoiceChip';
import { colors, font } from '@/constants/colors';
import type { Device, DeviceState } from '@/types/smart-home';

type Props = { device: Device; saving: boolean; onClose: () => void; onSave: (status: Device['status'], state: DeviceState) => Promise<void> };

// Bottom sheet for controlling one device: power on/off plus the control for
// its type (light brightness, AC temperature 16-30°C, or door lock). Edits are
// local drafts until Save, which hands them to the dashboard to persist.
export function DeviceControlSheet({ device, saving, onClose, onSave }: Props) {
  const [status, setStatus] = useState<Device['status']>(device.status || 'off');
  const [value, setValue] = useState(device.type === 'light' ? device.state?.brightness ?? 10 : device.state?.temperature ?? 22);
  const [locked, setLocked] = useState(device.state?.is_locked !== false);
  const [error, setError] = useState('');

  const save = async () => {
    const state: DeviceState = device.type === 'light' ? { brightness: value } : device.type === 'ac' ? { temperature: value } : device.type === 'doorlock' ? { is_locked: locked } : {};
    setError('');
    try { await onSave(status, state); }
    catch (reason) { setError((reason as Error).message); }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.shade}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.heading}><View><Text style={styles.room}>{device.room || 'Unassigned'}</Text><Text style={styles.title}>{device.name}</Text></View><Pressable onPress={onClose} accessibilityLabel="Close"><Text style={styles.close}>×</Text></Pressable></View>
          <Text style={styles.label}>Power</Text>
          <View style={styles.choices}><ChoiceChip label="Off" selected={status === 'off'} onPress={() => setStatus('off')} /><ChoiceChip label="On" selected={status === 'on'} onPress={() => setStatus('on')} /></View>

          {device.type === 'light' && <>
            <Text style={styles.label}>Brightness · {value}%</Text>
            <View style={styles.stepper}><StepButton label="−" onPress={() => setValue((current) => Math.max(1, current - 5))} /><Text style={styles.value}>{value}<Text style={styles.unit}>%</Text></Text><StepButton label="＋" onPress={() => setValue((current) => Math.min(100, current + 5))} /></View>
            <View style={styles.presets}>{[25, 50, 75, 100].map((preset) => <ChoiceChip key={preset} label={`${preset}%`} selected={value === preset} onPress={() => setValue(preset)} />)}</View>
          </>}

          {device.type === 'ac' && <>
            <Text style={styles.label}>Temperature</Text>
            <View style={styles.stepper}><StepButton label="−" onPress={() => setValue((current) => Math.max(16, current - 1))} /><Text style={styles.value}>{value}<Text style={styles.unit}>°C</Text></Text><StepButton label="＋" onPress={() => setValue((current) => Math.min(30, current + 1))} /></View>
            <Text style={styles.range}>16°C  ·  Comfortable  ·  30°C</Text>
          </>}

          {device.type === 'doorlock' && <View style={styles.lockBox}><Text style={styles.lockIcon}>{locked ? '▣' : '▢'}</Text><Text style={styles.lockText}>Door is {locked ? 'locked' : 'unlocked'}</Text><Button title={locked ? 'Unlock Door' : 'Lock Door'} secondary={!locked} onPress={() => setLocked((current) => !current)} /></View>}
          {!['light', 'ac', 'doorlock'].includes(device.type) && <Text style={styles.range}>No advanced settings available.</Text>}
          {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
          <Button title={saving ? 'Saving…' : 'Save Settings'} onPress={save} disabled={saving} />
        </View>
      </View>
    </Modal>
  );
}

function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.stepButton}><Text style={styles.stepText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  shade: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18,18,18,0.42)' },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 30 },
  handle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 3, backgroundColor: '#D5D1CB', marginBottom: 17 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  room: { color: colors.muted, fontFamily: font.regular, fontSize: 11 },
  title: { color: colors.ink, fontFamily: font.bold, fontSize: 21, marginTop: 3 },
  close: { color: colors.muted, fontSize: 30, paddingHorizontal: 6 },
  label: { color: colors.ink, fontFamily: font.bold, fontSize: 13, marginTop: 15, marginBottom: 8 },
  choices: { flexDirection: 'row', gap: 9 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 31, backgroundColor: colors.soft, borderRadius: 18, padding: 18 },
  stepButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.green, fontFamily: font.bold, fontSize: 20 },
  value: { color: colors.green, fontFamily: font.bold, fontSize: 38 },
  unit: { color: colors.muted, fontFamily: font.regular, fontSize: 19 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  range: { color: colors.muted, fontFamily: font.regular, textAlign: 'center', fontSize: 11, marginTop: 10 },
  lockBox: { alignItems: 'center', padding: 16, gap: 9, backgroundColor: colors.soft, borderRadius: 18, marginTop: 12 },
  lockIcon: { color: colors.green, fontSize: 35 },
  lockText: { color: colors.ink, fontFamily: font.bold, fontSize: 14 },
  error: { color: colors.red, fontFamily: font.regular, fontSize: 13, marginTop: 12 },
});
