import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/ui/Button';
import { ChoiceChip } from '@/components/ui/ChoiceChip';
import { Toast } from '@/components/ui/Toast';
import { colors, font } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services/api';
import type { Device, DeviceDraft, DeviceState } from '@/types/smart-home';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { DeviceCard } from './DeviceCard';
import { DeviceControlSheet } from './DeviceControlSheet';
import { DeviceEditorSheet } from './DeviceEditorSheet';

/**
 * Main device dashboard: hero stats, room filter chips, device grid, and the
 * add/edit, control, and delete sheets. Parents manage inventory and see the
 * family invite code; children only see devices shared with them.
 */
export function DashboardScreen() {
  const { session, ready, logout } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeRoom, setActiveRoom] = useState('All');
  const [weather, setWeather] = useState('Loading…');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | undefined>();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isParent = session?.role === 'parent';

  const showToast = useCallback((message: string) => {
    setNotice(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setNotice(''), 2800);
  }, []);

  // Central API error handler: an expired/invalid session logs the user out
  // and returns them to the login screen; other errors surface as a toast.
  const handleError = useCallback(async (error: unknown) => {
    const message = (error as Error).message || 'Something went wrong. Please try again.';
    if (/invalid or expired|access denied/i.test(message)) {
      await logout();
      router.replace('/login');
    }
    showToast(message);
  }, [logout, showToast]);

  const loadDevices = useCallback(async () => {
    if (!session) return;
    try {
      setDevices(await api.getDevices(session.token));
      setLoadError('');
    } catch (error) {
      setLoadError((error as Error).message || 'Could not load your devices.');
      await handleError(error);
    } finally {
      setLoading(false);
    }
  }, [session, handleError]);

  // Load server data when the authenticated session becomes available.
  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace('/login');
      return;
    }
    api.getDevices(session.token).then((items) => {
      setDevices(items);
      setLoadError('');
    }).catch(async (error: Error) => {
      setLoadError(error.message || 'Could not load your devices.');
      await handleError(error);
    }).finally(() => setLoading(false));
    api.getWeather().then((result) => {
      const temperature = result.main?.temp;
      setWeather(typeof temperature === 'number' ? `${Math.round(temperature)}°C · ${result.name || 'Haifa'}` : 'Haifa');
    }).catch(() => setWeather('Haifa'));
  }, [ready, session, handleError]);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const rooms = useMemo(() => ['All', ...Array.from(new Set(devices.map((device) => device.room || 'Unassigned')))], [devices]);
  const visibleDevices = useMemo(() => activeRoom === 'All' ? devices : devices.filter((device) => (device.room || 'Unassigned') === activeRoom), [devices, activeRoom]);
  const activeCount = devices.filter((device) => device.status === 'on').length;
  const roomCount = new Set(devices.map((device) => device.room || 'Unassigned')).size;

  const refresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  // Optimistic toggle: the UI flips immediately and rolls back if the API
  // request fails, so the switch always feels instant.
  const toggleDevice = async (device: Device) => {
    if (!session) return;
    const previousStatus = device.status;
    const nextStatus: Device['status'] = previousStatus === 'on' ? 'off' : 'on';
    setDevices((current) => current.map((item) => item.id === device.id ? { ...item, status: nextStatus } : item));
    try { await api.setDeviceStatus(session.token, device.id, nextStatus); }
    catch (error) {
      setDevices((current) => current.map((item) => item.id === device.id ? { ...item, status: previousStatus } : item));
      await handleError(error);
    }
  };

  const saveDevice = async (draft: DeviceDraft) => {
    if (!session) return;
    setSaving(true);
    try {
      if (editingDevice) await api.updateDevice(session.token, editingDevice.id, draft);
      else await api.createDevice(session.token, draft);
      setEditorOpen(false);
      setEditingDevice(undefined);
      await loadDevices();
      showToast(editingDevice ? 'Device updated successfully!' : 'Device added successfully!');
    } catch (error) {
      await handleError(error);
      throw error;
    } finally { setSaving(false); }
  };

  const deleteDevice = async () => {
    if (!session || !deletingDevice) return;
    setSaving(true);
    try {
      await api.deleteDevice(session.token, deletingDevice.id);
      setDeletingDevice(null);
      await loadDevices();
      showToast('Device deleted!');
    } catch (error) { await handleError(error); }
    finally { setSaving(false); }
  };

  // Persists the control sheet's edits: nested state (brightness, temperature,
  // lock) first, then the on/off status, then syncs the local list.
  const saveSettings = async (device: Device, status: Device['status'], state: DeviceState) => {
    if (!session) return;
    const hasState = Object.keys(state).length > 0;
    setSaving(true);
    try {
      if (hasState) await api.setDeviceState(session.token, device.id, state);
      await api.setDeviceStatus(session.token, device.id, status);
      setDevices((current) => current.map((item) => item.id === device.id ? { ...item, status, state: { ...item.state, ...state } } : item));
      setSelectedDevice(null);
      showToast('Settings saved!');
    } catch (error) { await handleError(error); throw error; }
    finally { setSaving(false); }
  };

  const copyFamilyCode = async () => {
    if (!session?.familyCode) return;
    try { await Clipboard.setStringAsync(session.familyCode); showToast('Invite code copied to clipboard!'); }
    catch { showToast('Could not copy invite code.'); }
  };

  if (!ready || !session) return <SafeAreaView style={styles.loading}><ActivityIndicator color={colors.green} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.green} />}>
        <View style={styles.nav}>
          <Brand compact />
          <View style={styles.navRight}>
            <View style={styles.navWeather}><Text style={styles.weatherIcon}>☼</Text><Text numberOfLines={1} style={styles.navWeatherText}>{weather}</Text></View>
            <Pressable onPress={async () => { await logout(); router.replace('/login'); }} hitSlop={10} style={styles.logoutButton}><Text style={styles.logout}>Logout</Text></Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Welcome back</Text>
          <Text style={styles.subtitle}>Monitor and control all your smart devices from one place.</Text>
          {isParent && !!session.familyCode && <Pressable accessibilityRole="button" accessibilityLabel="Copy family invite code" onPress={copyFamilyCode} style={styles.codeBox}><View><Text style={styles.heroMutedSmall}>FAMILY INVITE CODE</Text><Text style={styles.code}>{session.familyCode}</Text></View><Text style={styles.copyLabel}>COPY ↗</Text></Pressable>}
          <View style={styles.stats}>
            <Stat label="Total Devices" value={devices.length} />
            <Stat label="Active Now" value={activeCount} accent />
            <Stat label="Rooms" value={roomCount} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rooms}>
            {rooms.map((room) => <ChoiceChip key={room} label={room} selected={activeRoom === room} onPress={() => setActiveRoom(room)} />)}
          </ScrollView>
          {isParent && <Pressable onPress={() => { setEditingDevice(undefined); setEditorOpen(true); }} style={styles.addButton}><Text style={styles.addButtonText}>＋ Add</Text></Pressable>}
        </View>
        <Text style={styles.sectionTitle}>Devices</Text>

        {loading ? <View style={styles.empty}><ActivityIndicator color={colors.green} /><Text style={styles.emptyCaption}>Loading devices…</Text></View> : loadError ? (
          <View style={styles.empty}><Text style={styles.emptyTitle}>Can’t connect to your devices</Text><Text style={styles.emptyCaption}>{loadError}</Text><Button title="Retry" onPress={() => { setLoading(true); void loadDevices(); }} /></View>
        ) : devices.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyIcon}>⌂</Text><Text style={styles.emptyTitle}>Your home is ready</Text><Text style={styles.emptySubtitle}>{isParent ? 'Add a device to get started.' : 'No devices are shared with you yet.'}</Text></View>
        ) : visibleDevices.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyTitle}>No devices found here.</Text></View>
        ) : (
          <View style={styles.deviceList}>{visibleDevices.map((device) => <DeviceCard key={device.id} device={device} parent={!!isParent} onOpen={() => setSelectedDevice(device)} onToggle={() => toggleDevice(device)} onEdit={() => { setEditingDevice(device); setEditorOpen(true); }} onDelete={() => setDeletingDevice(device)} />)}</View>
        )}
        <Text style={styles.footer}>MSHome · Smart living, made simple</Text>
      </ScrollView>

      {editorOpen && <DeviceEditorSheet visible token={session.token} device={editingDevice} saving={saving} onClose={() => { setEditorOpen(false); setEditingDevice(undefined); }} onSave={saveDevice} />}
      {selectedDevice && <DeviceControlSheet device={selectedDevice} saving={saving} onClose={() => setSelectedDevice(null)} onSave={(status, state) => saveSettings(selectedDevice, status, state)} />}
      <ConfirmDeleteDialog deviceName={deletingDevice?.name} visible={!!deletingDevice} busy={saving} onCancel={() => setDeletingDevice(null)} onConfirm={deleteDevice} />
      <Toast message={notice} />
    </SafeAreaView>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return <View style={styles.statCard}><Text style={[styles.statValue, accent && styles.statAccent]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.paper },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.page },
  content: { paddingHorizontal: 19, paddingBottom: 34, backgroundColor: colors.page },
  nav: { height: 64, marginHorizontal: -19, paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.09)' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  navWeather: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 4 },
  weatherIcon: { color: colors.green, fontSize: 16 },
  navWeatherText: { color: colors.muted, fontFamily: font.regular, fontSize: 10, maxWidth: 100 },
  logoutButton: { paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: colors.line, borderRadius: 18 },
  logout: { color: colors.muted, fontFamily: font.bold, fontSize: 11 },
  hero: { marginHorizontal: -19, paddingHorizontal: 19, paddingTop: 24, paddingBottom: 22, backgroundColor: colors.green },
  heroTitle: { color: colors.paper, fontFamily: font.bold, fontSize: 25 },
  subtitle: { color: 'rgba(255,255,255,0.72)', fontFamily: font.regular, fontSize: 13, lineHeight: 19, marginTop: 5 },
  mutedSmall: { color: colors.muted, fontFamily: font.regular, fontSize: 11 },
  heroMutedSmall: { color: 'rgba(255,255,255,0.72)', fontFamily: font.regular, fontSize: 10 },
  codeBox: { backgroundColor: 'rgba(255,255,255,0.13)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', marginTop: 16, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { color: colors.paper, fontFamily: font.bold, fontSize: 18, letterSpacing: 2, marginTop: 4 },
  copyLabel: { color: '#D4E98F', fontFamily: font.bold, fontSize: 10, letterSpacing: 0.6 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 20 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.13)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' },
  statValue: { color: colors.paper, fontFamily: font.bold, fontSize: 25, lineHeight: 29 },
  statAccent: { color: '#C8E86A' },
  statLabel: { color: 'rgba(255,255,255,0.72)', fontFamily: font.regular, fontSize: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  sectionTitle: { color: colors.muted, fontFamily: font.bold, fontSize: 12, marginTop: 2, marginBottom: 13, letterSpacing: 1 },
  addButton: { flexShrink: 0, backgroundColor: colors.green, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 13, marginBottom: 4 },
  addButtonText: { color: colors.paper, fontFamily: font.bold, fontSize: 12 },
  rooms: { flexGrow: 1, gap: 8, paddingVertical: 10 },
  deviceList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  empty: { backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', padding: 32, borderRadius: 18, borderWidth: 1, borderColor: colors.line, gap: 8 },
  emptyIcon: { color: colors.green, fontSize: 36 },
  emptyTitle: { color: colors.ink, fontFamily: font.bold, fontSize: 17 },
  emptySubtitle: { color: colors.muted, fontFamily: font.regular, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  emptyCaption: { color: colors.muted, fontFamily: font.regular, fontSize: 13, marginTop: 4 },
  footer: { color: '#928D86', fontFamily: font.regular, fontSize: 11, textAlign: 'center', marginTop: 28 },
});
