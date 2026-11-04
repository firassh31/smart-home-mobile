import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ChoiceChip } from '@/components/ui/ChoiceChip';
import { TextField } from '@/components/ui/TextField';
import { colors, font } from '@/constants/colors';
import { api } from '@/services/api';
import type { Device, DeviceDraft, DeviceType } from '@/types/smart-home';

type Props = { visible: boolean; token: string; device?: Device; saving: boolean; onClose: () => void; onSave: (draft: DeviceDraft) => Promise<void> };

export function DeviceEditorSheet({ visible, token, device, saving, onClose, onSave }: Props) {
  const [types, setTypes] = useState<DeviceType[]>([]);
  const [name, setName] = useState(device?.name || '');
  const [room, setRoom] = useState(device?.room || '');
  const [type, setType] = useState(device?.type || 'light');
  const [childAccess, setChildAccess] = useState(!!device?.childAccess);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    api.getDeviceTypes(token).then(setTypes).catch((reason: Error) => setError(reason.message));
  }, [visible, token]);

  const submit = async () => {
    if (!name.trim() || !room.trim()) return setError('Enter both a device name and room.');
    setError('');
    try { await onSave({ name: name.trim(), room: room.trim(), type, childAccess }); }
    catch (reason) { setError((reason as Error).message); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.shade}>
        <ScrollView contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled">
          <View style={styles.handle} />
          <View style={styles.heading}><Text style={styles.title}>{device ? 'Edit Device' : 'Add New Device'}</Text><Pressable onPress={onClose} accessibilityLabel="Close"><Text style={styles.close}>×</Text></Pressable></View>
          <Text style={styles.label}>Device Type</Text>
          {types.length === 0 && !error ? <ActivityIndicator color={colors.green} /> : <View style={styles.types}>{types.map((item) => <ChoiceChip key={item.value} label={item.label} selected={type === item.value} onPress={() => setType(item.value)} />)}</View>}
          <TextField label="Device Name" value={name} onChangeText={setName} placeholder="e.g. Living Room Lamp" />
          <TextField label="Room" value={room} onChangeText={setRoom} placeholder="e.g. Bedroom" />
          <View style={styles.accessRow}><View style={styles.accessCopy}><Text style={styles.accessTitle}>Allow Child Access</Text><Text style={styles.helper}>Let child accounts control this device</Text></View><Switch value={childAccess} onValueChange={setChildAccess} trackColor={{ true: colors.green }} /></View>
          {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
          <View style={styles.actions}><Button title="Cancel" secondary onPress={onClose} /><Button title={saving ? 'Saving…' : 'Save'} onPress={submit} disabled={saving || types.length === 0} /></View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shade: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18,18,18,0.42)' },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 30 },
  handle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 3, backgroundColor: '#D5D1CB', marginBottom: 17 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.ink, fontFamily: font.bold, fontSize: 21, marginBottom: 10 },
  close: { color: colors.muted, fontSize: 30, paddingHorizontal: 6 },
  label: { color: colors.ink, fontFamily: font.bold, fontSize: 13, marginBottom: 8, marginTop: 8 },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  accessRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  accessCopy: { flex: 1, paddingRight: 12 },
  accessTitle: { color: colors.ink, fontFamily: font.bold, fontSize: 14 },
  helper: { color: colors.muted, fontFamily: font.regular, fontSize: 11, marginTop: 3 },
  error: { color: colors.red, fontFamily: font.regular, fontSize: 13, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
