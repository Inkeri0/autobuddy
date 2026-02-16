import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SERVICE_LABELS } from '../constants';
import { ServiceCategory } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useGarages } from '../hooks/useGarages';
import { fetchUserBookings } from '../services/garageService';

const QUICK_SERVICES: { category: ServiceCategory; icon: string }[] = [
  { category: 'apk', icon: 'clipboard-check-outline' },
  { category: 'oil_change', icon: 'oil' },
  { category: 'small_service', icon: 'wrench' },
  { category: 'major_service', icon: 'cog' },
  { category: 'tire_change', icon: 'tire' },
  { category: 'brakes', icon: 'car-brake-alert' },
  { category: 'airco_service', icon: 'snowflake' },
  { category: 'diagnostics', icon: 'laptop' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'In afwachting',
  confirmed: 'Bevestigd',
  in_progress: 'Bezig',
};

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning,
  confirmed: COLORS.success,
  in_progress: COLORS.primary,
};

function formatDateNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { garages, loading: garagesLoading } = useGarages();
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || '';
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const initials = (user?.user_metadata?.full_name || '?')
    .split(' ')
    .map((w: string) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (user?.id) {
      fetchUserBookings(user.id)
        .then(setBookings)
        .catch((err) => console.error('Failed to load bookings:', err))
        .finally(() => setBookingsLoading(false));
    } else {
      setBookingsLoading(false);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        const data = await fetchUserBookings(user.id);
        setBookings(data);
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  const handleServicePress = (category: ServiceCategory) => {
    navigation.navigate('Search', { serviceCategory: category });
  };

  // Get the next upcoming booking
  const nextBooking = bookings
    .filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.white}
          title="Vernieuwen..."
          titleColor={COLORS.white}
          colors={[COLORS.primary]}
          progressBackgroundColor={COLORS.white}
        />
      }
    >
      {/* Purple Gradient Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight, '#7c5caa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <View style={styles.headerRow}>
          <View style={[styles.avatarCircle, avatarUrl && styles.avatarCircleWithImage]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.greeting}>
              Hoi, {firstName || 'daar'}! {'\uD83D\uDC4B'}
            </Text>
            <Text style={styles.subtitle}>Je auto staat er goed bij.</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content below header with light background */}
      <View style={styles.belowHeader}>
        {/* Floating Search Bar */}
        <View style={styles.searchWrapper}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textLight} />
            <Text style={styles.searchPlaceholder}>Zoek een garage in de buurt...</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
        {/* Services Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Onze Services</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
            <Text style={styles.seeAllLink}>Bekijk alles</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {QUICK_SERVICES.map((item) => (
            <TouchableOpacity
              key={item.category}
              style={styles.serviceItem}
              onPress={() => handleServicePress(item.category)}
              activeOpacity={0.7}
            >
              <View style={styles.serviceIconCircle}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={26}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.serviceLabel} numberOfLines={1}>
                {SERVICE_LABELS[item.category]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Booking */}
        <Text style={styles.sectionTitle}>Eerstvolgende afspraak</Text>
        {bookingsLoading ? (
          <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 20 }} />
        ) : nextBooking ? (
          <View style={styles.bookingCard}>
            <View style={styles.bookingTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookingServiceName}>
                  {nextBooking.garage_services?.name || 'Service'}
                </Text>
                <View style={styles.bookingGarageRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.bookingGarageName}>
                    {nextBooking.garages?.name || 'Garage'}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.bookingBadge,
                  { backgroundColor: (STATUS_COLORS[nextBooking.status] || COLORS.primary) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.bookingBadgeText,
                    { color: STATUS_COLORS[nextBooking.status] || COLORS.primary },
                  ]}
                >
                  {STATUS_LABELS[nextBooking.status] || nextBooking.status}
                </Text>
              </View>
            </View>

            <View style={styles.bookingDateRow}>
              <View style={styles.bookingDateItem}>
                <MaterialCommunityIcons name="calendar-month" size={18} color={COLORS.secondary} />
                <Text style={styles.bookingDateText}>{formatDateNL(nextBooking.date)}</Text>
              </View>
              <View style={styles.bookingDateDivider} />
              <View style={styles.bookingDateItem}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.secondary} />
                <Text style={styles.bookingDateText}>{nextBooking.time_slot} uur</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bookingDetailsBtn}
              onPress={() => navigation.navigate('AfspraakDetail', { bookingId: nextBooking.id })}
              activeOpacity={0.85}
            >
              <Text style={styles.bookingDetailsBtnText}>Details bekijken</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyBooking}>
            <MaterialCommunityIcons name="calendar-blank" size={36} color={COLORS.textLight} />
            <Text style={styles.emptyBookingText}>Nog geen afspraken gepland</Text>
            <TouchableOpacity
              style={styles.emptyBookingCta}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyBookingCtaText}>Zoek een garage</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Map Preview */}
        <TouchableOpacity
          style={styles.mapCard}
          onPress={() => navigation.navigate('Map')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#3d4f3d', '#2d3d2d']}
            style={styles.mapCardGradient}
          >
            <Text style={styles.mapTitle}>Vind garages in de buurt</Text>
            <Text style={styles.mapSubtitle}>
              {garagesLoading
                ? 'Laden...'
                : `Er zijn ${garages.length} garages bij jou in de regio.`}
            </Text>
            <View style={styles.mapButton}>
              <MaterialCommunityIcons name="map" size={16} color={COLORS.white} />
              <Text style={styles.mapButtonText}>Kaart bekijken</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  belowHeader: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  decorCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(249,115,22,0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarCircleWithImage: {
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'transparent',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search bar
  searchWrapper: {
    marginTop: -26,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: COLORS.textLight,
  },

  // Content
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 14,
  },

  // Services grid (4 columns)
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 28,
  },
  serviceItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Booking card
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bookingServiceName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  bookingGarageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bookingGarageName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bookingBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bookingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  bookingDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingDateDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
    marginHorizontal: 14,
  },
  bookingDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  bookingDetailsBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookingDetailsBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // Empty booking
  emptyBooking: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyBookingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 16,
  },
  emptyBookingCta: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBookingCtaText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },

  // Map card
  mapCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapCardGradient: {
    padding: 24,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  mapSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    marginBottom: 16,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
