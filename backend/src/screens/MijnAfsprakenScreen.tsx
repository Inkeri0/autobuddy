import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { fetchUserBookings, cancelBooking } from '../services/garageService';
import { BookingStatus } from '../types';
import StarDisplay from '../components/StarDisplay';
import { formatDateCompactNL, formatDateShortNL } from '../utils/dateFormatters';

type SegmentTab = 'aankomend' | 'verleden';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'In afwachting',
  confirmed: 'Bevestigd',
  in_progress: 'Bezig',
  completed: 'Voltooid',
  cancelled: 'Geannuleerd',
  no_show: 'Niet verschenen',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: COLORS.secondary,
  confirmed: COLORS.success,
  in_progress: COLORS.primary,
  completed: COLORS.textSecondary,
  cancelled: COLORS.danger,
  no_show: COLORS.danger,
};

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress'];
const PAST_STATUSES: BookingStatus[] = ['completed', 'cancelled', 'no_show'];

function getServiceIcon(serviceName?: string): string {
  if (!serviceName) return 'wrench';
  const name = serviceName.toLowerCase();
  if (name.includes('apk')) return 'car-cog';
  if (name.includes('olie') || name.includes('oil')) return 'oil';
  if (name.includes('band') || name.includes('tire')) return 'tire';
  if (name.includes('rem') || name.includes('brake')) return 'car-brake-alert';
  if (name.includes('airco')) return 'snowflake';
  if (name.includes('diagnos')) return 'laptop';
  if (name.includes('kleine beurt') || name.includes('small')) return 'wrench';
  if (name.includes('grote beurt') || name.includes('major')) return 'cog';
  if (name.includes('carrosserie') || name.includes('body')) return 'car-side';
  return 'wrench';
}

export default function MijnAfsprakenScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const isTab = route.name === 'Afspraken';
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [segment, setSegment] = useState<SegmentTab>('aankomend');

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

  const upcomingBookings = bookings
    .filter((b) => ACTIVE_STATUSES.includes(b.status))
    .sort((a, b) => a.date.localeCompare(b.date));

  const pastBookings = bookings
    .filter((b) => PAST_STATUSES.includes(b.status))
    .sort((a, b) => b.date.localeCompare(a.date));

  const currentList = segment === 'aankomend' ? upcomingBookings : pastBookings;

  const canCancel = (status: BookingStatus) =>
    status === 'pending' || status === 'confirmed';

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTopRow}>
          {!isTab && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-left" size={26} color={COLORS.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, isTab && { flex: 1 }]}>Mijn afspraken</Text>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Segment control */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, segment === 'aankomend' && styles.segmentBtnActive]}
            onPress={() => setSegment('aankomend')}
          >
            <Text
              style={[
                styles.segmentText,
                segment === 'aankomend' && styles.segmentTextActive,
              ]}
            >
              Aankomend
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, segment === 'verleden' && styles.segmentBtnActive]}
            onPress={() => setSegment('verleden')}
          >
            <Text
              style={[
                styles.segmentText,
                segment === 'verleden' && styles.segmentTextActive,
              ]}
            >
              Verleden
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Section header */}
        {segment === 'aankomend' && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aankomende services</Text>
            {upcomingBookings.length > 0 && (
              <Text style={styles.sectionCount}>
                {upcomingBookings.length} AFSPRAKEN
              </Text>
            )}
          </View>
        )}

        {segment === 'verleden' && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Verleden</Text>
          </View>
        )}

        {/* Booking cards */}
        {currentList.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={48}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>Geen afspraken gevonden</Text>
            <Text style={styles.emptySubText}>
              {segment === 'aankomend'
                ? 'Je hebt geen aankomende afspraken.'
                : 'Je hebt nog geen afgeronde afspraken.'}
            </Text>
          </View>
        ) : segment === 'aankomend' ? (
          /* Upcoming cards */
          currentList.map((item) => {
            const garage = item.garages;
            const service = item.garage_services;
            const serviceName = service?.name || 'Service';
            const icon = getServiceIcon(serviceName);
            const isConfirmed = item.status === 'confirmed';

            return (
              <View key={item.id} style={styles.upcomingCard}>
                {/* Top: icon + info + badge */}
                <View style={styles.upcomingTop}>
                  <View style={styles.upcomingTopLeft}>
                    <View style={styles.serviceIconCircle}>
                      <MaterialCommunityIcons
                        name={icon as any}
                        size={22}
                        color={COLORS.secondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.upcomingServiceName}>{serviceName}</Text>
                      <Text style={styles.upcomingGarageName}>
                        {garage?.name || 'Garage'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          STATUS_COLORS[item.status as BookingStatus] + '15',
                      },
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

                {/* Date / time row */}
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateTimeItem}>
                    <MaterialCommunityIcons
                      name="calendar-blank-outline"
                      size={16}
                      color={COLORS.textLight}
                    />
                    <Text style={styles.dateTimeText}>
                      {formatDateCompactNL(item.date)}
                    </Text>
                  </View>
                  <View style={styles.dateTimeItem}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={16}
                      color={COLORS.textLight}
                    />
                    <Text style={styles.dateTimeText}>{item.time_slot}</Text>
                  </View>
                </View>

                {/* Details button */}
                <TouchableOpacity
                  style={[
                    styles.detailsBtn,
                    isConfirmed
                      ? styles.detailsBtnPrimary
                      : styles.detailsBtnSecondary,
                  ]}
                  onPress={() =>
                    navigation.navigate('AfspraakDetail', { bookingId: item.id })
                  }
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.detailsBtnText,
                      isConfirmed
                        ? styles.detailsBtnTextPrimary
                        : styles.detailsBtnTextSecondary,
                    ]}
                  >
                    Details bekijken
                  </Text>
                </TouchableOpacity>

                {/* Cancel link for pending/confirmed */}
                {canCancel(item.status) && (
                  <TouchableOpacity
                    style={styles.cancelLink}
                    onPress={() => handleCancel(item.id)}
                  >
                    <Text style={styles.cancelLinkText}>Annuleren</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          /* Past cards */
          currentList.map((item) => {
            const garage = item.garages;
            const service = item.garage_services;
            const serviceName = service?.name || 'Service';
            const icon = getServiceIcon(serviceName);
            const isCompleted = item.status === 'completed';

            return (
              <View key={item.id} style={styles.pastCard}>
                {/* Top: icon + info + badge */}
                <View style={styles.pastTop}>
                  <View style={styles.pastTopLeft}>
                    <View style={styles.pastIconCircle}>
                      <MaterialCommunityIcons
                        name={icon as any}
                        size={22}
                        color={COLORS.textLight}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pastServiceName}>{serviceName}</Text>
                      <Text style={styles.pastGarageName}>
                        {garage?.name || 'Garage'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pastBadge}>
                    <Text style={styles.pastBadgeText}>
                      {STATUS_LABELS[item.status as BookingStatus]}
                    </Text>
                  </View>
                </View>

                {/* Bottom row: date + review/stars */}
                <View style={styles.pastBottomRow}>
                  <Text style={styles.pastDate}>
                    {formatDateShortNL(item.date)}
                  </Text>
                  {isCompleted && !item.user_rating ? (
                    <TouchableOpacity
                      style={styles.reviewBtn}
                      onPress={() =>
                        navigation.navigate('Review', { bookingId: item.id })
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.reviewBtnText}>Beoordeel</Text>
                    </TouchableOpacity>
                  ) : item.user_rating ? (
                    <StarDisplay rating={item.user_rating} size={16} />
                  ) : null}
                </View>
              </View>
            );
          })
        )}

        {/* Upsell banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Hulp nodig bij pech?</Text>
            <Text style={styles.bannerSubtitle}>
              Onze pechhulp staat 24/7 voor je klaar in heel Nederland.
            </Text>
            <TouchableOpacity style={styles.bannerBtn} activeOpacity={0.85}>
              <Text style={styles.bannerBtnText}>Bel nu direct</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerIconContainer}>
            <MaterialCommunityIcons
              name="headset"
              size={80}
              color="rgba(255,255,255,0.15)"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Segment control
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 999,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 1,
  },

  // Upcoming card
  upcomingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  upcomingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  upcomingTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingServiceName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  upcomingGarageName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Date/time row
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 24,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Details button
  detailsBtn: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  detailsBtnPrimary: {
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsBtnSecondary: {
    backgroundColor: COLORS.background,
  },
  detailsBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  detailsBtnTextPrimary: {
    color: COLORS.white,
  },
  detailsBtnTextSecondary: {
    color: COLORS.text,
  },

  // Cancel link
  cancelLink: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 4,
  },
  cancelLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },

  // Past card
  pastCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    opacity: 0.85,
  },
  pastTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  pastTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  pastIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastServiceName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  pastGarageName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pastBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  pastBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pastBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastDate: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  reviewBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  reviewBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Upsell banner
  bannerCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContent: {
    position: 'relative',
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  bannerBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  bannerIconContainer: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    transform: [{ rotate: '12deg' }],
  },
});
