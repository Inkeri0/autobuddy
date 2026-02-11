import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SERVICE_LABELS } from '../constants';
import { ServiceCategory } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useGarages } from '../hooks/useGarages';
import { fetchUserBookings } from '../services/garageService';

const QUICK_SERVICES: { category: ServiceCategory; icon: string }[] = [
  { category: 'apk', icon: '📋' },
  { category: 'oil_change', icon: '🛢️' },
  { category: 'small_service', icon: '🔧' },
  { category: 'major_service', icon: '🔩' },
  { category: 'tire_change', icon: '🛞' },
  { category: 'brakes', icon: '🛑' },
  { category: 'airco_service', icon: '❄️' },
  { category: 'diagnostics', icon: '💻' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { garages, loading: garagesLoading } = useGarages();
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserBookings(user.id)
        .then(setBookings)
        .catch((err) => {
          console.error('Failed to load bookings:', err);
        })
        .finally(() => setBookingsLoading(false));
    } else {
      setBookingsLoading(false);
    }
  }, [user?.id]);

  const handleServicePress = (category: ServiceCategory) => {
    navigation.navigate('Search', { serviceCategory: category });
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'no_show'
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hoi{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! 👋
        </Text>
        <Text style={styles.subtitle}>Wat wil je vandaag regelen?</Text>
      </View>

      {/* Quick search bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={styles.searchPlaceholder}>
          🔍  Zoek garage, service of merk...
        </Text>
      </TouchableOpacity>

      {/* Service categories grid */}
      <Text style={styles.sectionTitle}>Populaire services</Text>
      <View style={styles.servicesGrid}>
        {QUICK_SERVICES.map((item) => (
          <TouchableOpacity
            key={item.category}
            style={styles.serviceCard}
            onPress={() => handleServicePress(item.category)}
          >
            <Text style={styles.serviceIcon}>{item.icon}</Text>
            <Text style={styles.serviceLabel}>
              {SERVICE_LABELS[item.category]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map preview */}
      <Text style={styles.sectionTitle}>Garages in de buurt</Text>
      <TouchableOpacity
        style={styles.mapPreview}
        onPress={() => navigation.navigate('Map')}
      >
        {garagesLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Text style={styles.mapPreviewText}>
              🗺️  Bekijk garages op de kaart
            </Text>
            <Text style={styles.mapPreviewSub}>
              {garages.length} garage{garages.length !== 1 ? 's' : ''} beschikbaar
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Upcoming bookings */}
      <Text style={styles.sectionTitle}>Mijn afspraken</Text>
      {bookingsLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 20 }} />
      ) : upcomingBookings.length > 0 ? (
        upcomingBookings.slice(0, 3).map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingGarage}>{booking.garages?.name || 'Garage'}</Text>
              <View style={[styles.statusBadge, {
                backgroundColor: booking.status === 'confirmed' ? '#ECFDF5' : '#FEF3C7',
              }]}>
                <Text style={[styles.statusText, {
                  color: booking.status === 'confirmed' ? COLORS.success : COLORS.warning,
                }]}>
                  {booking.status === 'pending' ? 'In afwachting' :
                   booking.status === 'confirmed' ? 'Bevestigd' :
                   booking.status === 'in_progress' ? 'Bezig' : booking.status}
                </Text>
              </View>
            </View>
            <Text style={styles.bookingService}>
              {booking.garage_services?.name || 'Service'}
            </Text>
            <Text style={styles.bookingDate}>
              📅 {booking.date} om {booking.time_slot}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nog geen afspraken gepland
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.ctaButtonText}>Zoek een garage</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  mapPreview: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  mapPreviewText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  mapPreviewSub: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingGarage: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingService: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  bookingDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
