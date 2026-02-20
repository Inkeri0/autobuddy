import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

export default function OfflineBanner() {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();

  if (netInfo.isConnected !== false) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 4 }]}>
      <MaterialCommunityIcons name="wifi-off" size={16} color={COLORS.white} />
      <Text style={styles.text}>Geen internetverbinding</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    zIndex: 999,
    gap: 8,
  },
  text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});