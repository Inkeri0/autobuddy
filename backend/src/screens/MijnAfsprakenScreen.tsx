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
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { fetchUserBookings, cancelBooking } from '../services/garageService';
import { BookingStatus } from '../types';

type FilterTab = 'alle' | 'actief' | 'afgerond' | 'geannuleerd';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'In afwachting',
  confirmed: 'Bevestigd',
  in_progress: 'Bezig',
  completed: 'Afgerond',
  cancelled: 'Geannuleerd',
  no_show: 'Niet verschenen',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: COLORS.warning,
  confirmed: COLORS.success,
  in_progress: COLORS.primary,
  completed: COLORS.textSecondary,
  cancelled: COLORS.danger,
  no_show: COLORS.danger,
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'actief', label: 'Actief' },
  { key: 'afgerond', label: 'Afgerond' },
  { key: 'geannuleerd', label: 'Geannuleerd' },
];

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress'];
const COMPLETED_STATUSES: BookingStatus[] = ['completed'];
const CANCELLED_STATUSES: BookingStatus[] = ['cancelled', 'no_show'];

export default function MijnAfsprakenScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('alle');

  const loadBookings = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchUserBookings(user.id);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      Alert.alert('Fout', 'Kon afspraken niet laden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      'Afspraak annuleren',
      'Weet je zeker dat je deze afspraak wilt annuleren?',
      [
        { text: 'Nee', style: 'cancel' },
        {
          text: 'Ja, annuleren',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId);
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === bookingId ? { ...b, status: 'cancelled' } : b
                )
              );
            } catch (err) {
              console.error('Failed to cancel booking:', err);
              Alert.alert('Fout', 'Kon afspraak niet annuleren.');
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((b) => {
    switch (activeTab) {
      case 'actief':
        return ACTIVE_STATUSES.includes(b.status);
      case 'afgerond':
        return COMPLETED_STATUSES.includes(b.status);
      case 'geannuleerd':
        return CANCELLED_STATUSES.includes(b.status);
      default:
        return true;
    }
  });

  const canCancel = (status: BookingStatus) =>
    status === 'pending' || status === 'confirmed';

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderBooking = ({ item }: { item: any }) => {
    const garage = item.garages;
    const service = item.garage_services;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('AfspraakDetail', { bookingId: item.id })
        }
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.garageName}>{garage?.name || 'Garage'}</Text>
            <Text style={styles.serviceText}>
              {service?.name || 'Service'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[item.status as BookingStatus] + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: STATUS_COLORS[item.status as BookingStatus] },
              ]}
            >
              {STATUS_LABELS[item.status as BookingStatus]}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Datum</Text>
          <Text style={styles.detailValue}>
            {item.date} om {item.time_slot}
          </Text>
        </View>

        {item.car_brand && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Auto</Text>
            <Text style={styles.detailValue}>
              {item.car_brand} {item.car_model}
              {item.car_year ? ` (${item.car_year})` : ''}
              {item.car_license_plate ? ` · ${item.car_license_plate}` : ''}
            </Text>
          </View>
        )}

        {garage?.city && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Locatie</Text>
            <Text style={styles.detailValue}>{garage.city}</Text>
          </View>
        )}

        {item.status === 'completed' && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => navigation.navigate('Review', { bookingId: item.id })}
          >
            <Text style={styles.reviewText}>Beoordeel</Text>
          </TouchableOpacity>
        )}

        {canCancel(item.status) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(item.id)}
          >
            <Text style={styles.cancelText}>Annuleren</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>Geen afspraken gevonden</Text>
            <Text style={styles.emptySubText}>
              {activeTab === 'alle'
                ? 'Je hebt nog geen afspraken gemaakt.'
                : 'Geen afspraken in deze categorie.'}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  garageName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  serviceText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailLabel: { fontSize: 13, color: COLORS.textSecondary },
  detailValue: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  reviewButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
  },
  reviewText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  cancelButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    alignItems: 'center',
  },
  cancelText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
