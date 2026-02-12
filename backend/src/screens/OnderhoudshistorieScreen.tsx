import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SERVICE_LABELS } from '../constants';
import { ServiceCategory } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
  fetchMaintenanceHistory,
  fetchMaintenanceForCar,
} from '../services/garageService';

function formatDateNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function OnderhoudshistorieScreen() {
  const route = useRoute<any>();
  const { user } = useAuth();
  const licensePlate: string | undefined = route.params?.licensePlate;
  const carName: string | undefined = route.params?.carName;

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    if (!user) return;
    try {
      const data = licensePlate
        ? await fetchMaintenanceForCar(user.id, licensePlate)
        : await fetchMaintenanceHistory(user.id);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load maintenance history:', err);
      Alert.alert('Fout', 'Kon onderhoudshistorie niet laden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, licensePlate]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };

  // Find the latest next_apk_date across all records
  const nextApkDate = records.find((r) => r.next_apk_date)?.next_apk_date;
  const apkDaysLeft = nextApkDate ? daysUntil(nextApkDate) : null;

  const getServiceLabel = (record: any): string => {
    const category = record.bookings?.garage_services?.category;
    if (category && SERVICE_LABELS[category as ServiceCategory]) {
      return SERVICE_LABELS[category as ServiceCategory];
    }
    const serviceName = record.bookings?.garage_services?.name;
    return serviceName || 'Onderhoud';
  };

  const renderRecord = ({ item, index }: { item: any; index: number }) => {
    const olderRecord = records[index + 1];
    const mileageDelta = olderRecord ? item.mileage - olderRecord.mileage : null;
    const isExpanded = expandedId === item.id;
    const garageName = item.garages?.name || 'Onbekende garage';
    const garageCity = item.garages?.city || '';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceLabel}>{getServiceLabel(item)}</Text>
            <Text style={styles.dateText}>{formatDateNL(item.service_date)}</Text>
          </View>
          <View style={styles.mileageBadge}>
            <Text style={styles.mileageText}>
              {item.mileage.toLocaleString('nl-NL')} km
            </Text>
            {mileageDelta !== null && mileageDelta > 0 && (
              <Text style={styles.mileageDelta}>+{mileageDelta.toLocaleString('nl-NL')}</Text>
            )}
          </View>
        </View>

        <View style={styles.garageRow}>
          <MaterialCommunityIcons name="wrench" size={14} color={COLORS.textSecondary} />
          <Text style={styles.garageText}>
            {garageName}{garageCity ? `, ${garageCity}` : ''}
          </Text>
        </View>

        {!licensePlate && item.car_brand && (
          <View style={styles.carRow}>
            <MaterialCommunityIcons name="car" size={14} color={COLORS.textSecondary} />
            <Text style={styles.carText}>
              {item.car_brand} {item.car_model || ''} — {item.car_license_plate}
            </Text>
          </View>
        )}

        {item.next_apk_date && (
          <View style={styles.apkBadgeRow}>
            <View style={styles.apkBadge}>
              <Text style={styles.apkBadgeText}>
                APK geldig tot {formatDateNL(item.next_apk_date)}
              </Text>
            </View>
          </View>
        )}

        {isExpanded && item.work_description ? (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>Uitgevoerd werk</Text>
            <Text style={styles.descriptionText}>{item.work_description}</Text>
          </View>
        ) : (
          item.work_description && (
            <Text style={styles.descriptionPreview} numberOfLines={1}>
              {item.work_description}
            </Text>
          )
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {licensePlate && carName && (
              <View style={styles.carHeader}>
                <MaterialCommunityIcons name="car" size={24} color={COLORS.primary} style={{ marginBottom: 6 }} />
                <Text style={styles.carHeaderName}>{carName}</Text>
                <Text style={styles.carHeaderPlate}>{licensePlate}</Text>
                {records.length > 0 && (
                  <Text style={styles.carHeaderMileage}>
                    Laatste km-stand: {records[0].mileage.toLocaleString('nl-NL')} km
                  </Text>
                )}
              </View>
            )}
            {apkDaysLeft !== null && apkDaysLeft <= 60 && (
              <View style={[
                styles.apkAlert,
                { borderLeftColor: apkDaysLeft <= 0 ? COLORS.danger : COLORS.warning },
                { backgroundColor: apkDaysLeft <= 0 ? COLORS.danger + '15' : COLORS.warning + '15' },
              ]}>
                <MaterialCommunityIcons
                  name={apkDaysLeft <= 0 ? 'alert-circle' : 'clipboard-alert'}
                  size={18}
                  color={apkDaysLeft <= 0 ? COLORS.danger : COLORS.warning}
                  style={{ marginRight: 8 }}
                />
                <Text style={[
                  styles.apkAlertText,
                  { color: apkDaysLeft <= 0 ? COLORS.danger : COLORS.warning },
                ]}>
                  {apkDaysLeft <= 0
                    ? `APK is verlopen op ${formatDateNL(nextApkDate!)}`
                    : `APK verloopt over ${apkDaysLeft} dagen (${formatDateNL(nextApkDate!)})`}
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Nog geen onderhoudshistorie</Text>
            <Text style={styles.emptySubText}>
              Onderhoudsgegevens worden toegevoegd door garages wanneer ze jouw afspraak afronden.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  carHeader: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  carHeaderName: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  carHeaderPlate: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, fontFamily: 'monospace' },
  carHeaderMileage: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 8 },
  apkAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  apkAlertText: { fontSize: 14, fontWeight: '600', flex: 1 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  dateText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  mileageBadge: { alignItems: 'flex-end' },
  mileageText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  mileageDelta: { fontSize: 12, color: COLORS.success, fontWeight: '500', marginTop: 2 },
  garageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  garageText: { fontSize: 13, color: COLORS.textSecondary },
  carRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  carText: { fontSize: 13, color: COLORS.textSecondary },
  apkBadgeRow: { marginTop: 8 },
  apkBadge: {
    backgroundColor: COLORS.primary + '12',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  apkBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  descriptionPreview: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 8,
  },
  descriptionBox: {
    marginTop: 10,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
  },
  descriptionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  descriptionText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginTop: 10 },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
