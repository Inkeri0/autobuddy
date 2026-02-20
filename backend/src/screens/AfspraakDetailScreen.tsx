import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { BookingStatus } from '../types';
import { fetchBookingById, cancelBooking, fetchUserCars } from '../services/garageService';
import { useAuth } from '../hooks/useAuth';
import { formatDateLongNL } from '../utils/dateFormatters';
import LicensePlate from '../components/LicensePlate';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'In afwachting',
  confirmed: 'Bevestigd',
  in_progress: 'Bezig',
  completed: 'Afgerond',
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

const STATUS_ICONS: Record<BookingStatus, string> = {
  pending: 'clock-outline',
  confirmed: 'check-circle',
  in_progress: 'progress-wrench',
  completed: 'check-circle-outline',
  cancelled: 'close-circle-outline',
  no_show: 'account-alert-outline',
};

export default function AfspraakDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [carPhotoUrl, setCarPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingById(bookingId)
      .then(setBooking)
      .catch((err) => {
        console.error('Failed to load booking:', err);
        Alert.alert('Fout', 'Kon afspraak niet laden.');
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Fetch the car photo by matching license plate
  useEffect(() => {
    if (!user?.id || !booking?.car_license_plate) return;
    fetchUserCars(user.id)
      .then((cars) => {
        const match = cars.find((c: any) => c.license_plate === booking.car_license_plate);
        if (match?.photo_url) setCarPhotoUrl(match.photo_url);
      })
      .catch(() => {});
  }, [user?.id, booking?.car_license_plate]);

  const handleCancel = () => {
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
              setBooking((prev: any) => ({ ...prev, status: 'cancelled' }));
            } catch (err) {
              console.error('Failed to cancel booking:', err);
              Alert.alert('Fout', 'Kon afspraak niet annuleren.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ fontSize: 16, color: COLORS.danger }}>
          Afspraak niet gevonden
        </Text>
      </View>
    );
  }

  const garage = booking.garages;
  const service = booking.garage_services;
  const status = booking.status as BookingStatus;
  const canCancel = status === 'pending' || status === 'confirmed';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Afspraak details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Status banner */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusLabel}>STATUS</Text>
            <Text style={styles.statusValue}>Ingepland</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[status] + '15' },
            ]}
          >
            <MaterialCommunityIcons
              name={STATUS_ICONS[status] as any}
              size={16}
              color={STATUS_COLORS[status]}
            />
            <Text style={[styles.statusBadgeText, { color: STATUS_COLORS[status] }]}>
              {STATUS_LABELS[status]}
            </Text>
          </View>
        </View>

        {/* 2. Date & Time card */}
        <View style={styles.card}>
          <View style={styles.dateTimeTop}>
            <View style={styles.dateIconCircle}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={22}
                color={COLORS.secondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>Datum & Tijd</Text>
              <Text style={styles.dateValue}>{formatDateLongNL(booking.date)}</Text>
              <Text style={styles.timeValue}>{booking.time_slot} uur</Text>
            </View>
          </View>

          {booking.notes && (
            <>
              <View style={styles.cardDivider} />
              <View>
                <Text style={styles.notesLabel}>Mijn opmerkingen</Text>
                <Text style={styles.notesText}>"{booking.notes}"</Text>
              </View>
            </>
          )}
        </View>

        {/* 3. Service card */}
        {service && (
          <View style={styles.card}>
            <View style={styles.serviceTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceLabel}>Service</Text>
                <Text style={styles.serviceName}>{service.name}</Text>
              </View>
              {(service.price_from || service.price_to) && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.priceLabel}>SCHATTING</Text>
                  <Text style={styles.priceValue}>
                    {'\u20AC'}{service.price_from} - {'\u20AC'}{service.price_to}
                  </Text>
                </View>
              )}
            </View>
            {service.description && (
              <Text style={styles.serviceDescription}>{service.description}</Text>
            )}
          </View>
        )}

        {/* 4. Car info card */}
        {booking.car_brand && (
          <View style={styles.card}>
            <View style={styles.carRow}>
              <View style={styles.carImagePlaceholder}>
                {carPhotoUrl ? (
                  <Image source={{ uri: carPhotoUrl }} style={styles.carPhoto} />
                ) : (
                  <MaterialCommunityIcons name="car-side" size={28} color={COLORS.textLight} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.carLabel}>UW VOERTUIG</Text>
                <Text style={styles.carName}>
                  {booking.car_brand} {booking.car_model}
                </Text>
              </View>
              {booking.car_license_plate && (
                <LicensePlate plate={booking.car_license_plate} />
              )}
            </View>
          </View>
        )}

        {/* 5. Garage info card */}
        {garage && (
          <View style={styles.card}>
            <View style={styles.garageTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.garageName}>{garage.name}</Text>
                <View style={styles.garageAddressRow}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.garageAddress}>
                    {garage.address}, {garage.postal_code} {garage.city}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.garageMapBtn}
                onPress={() =>
                  navigation.navigate('GarageDetail', { garageId: garage.id })
                }
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color={COLORS.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.garageActions}>
              {garage.phone && (
                <TouchableOpacity
                  style={styles.garageActionBtn}
                  onPress={() => Linking.openURL(`tel:${garage.phone}`)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="phone" size={18} color={COLORS.secondary} />
                  <Text style={styles.garageActionText}>Bellen</Text>
                </TouchableOpacity>
              )}
              {garage.email && (
                <TouchableOpacity
                  style={styles.garageActionBtn}
                  onPress={() => Linking.openURL(`mailto:${garage.email}`)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="email-outline" size={18} color={COLORS.secondary} />
                  <Text style={styles.garageActionText}>E-mail</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* 6. Garage notes */}
        {booking.garage_notes && (
          <View style={styles.garageNotesCard}>
            <View style={styles.garageNotesHeader}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={COLORS.secondary}
              />
              <Text style={styles.garageNotesTitle}>Garage opmerkingen</Text>
            </View>
            <Text style={styles.garageNotesText}>{booking.garage_notes}</Text>
          </View>
        )}

        {/* 7. Review button for completed */}
        {status === 'completed' && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => navigation.navigate('Review', { bookingId })}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="star-outline" size={18} color={COLORS.white} />
            <Text style={styles.reviewButtonText}>Beoordeel deze afspraak</Text>
          </TouchableOpacity>
        )}

        {/* 8. Cancel button */}
        {canCancel && (
          <View style={styles.cancelSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={20}
                color={COLORS.danger}
              />
              <Text style={styles.cancelText}>Afspraak annuleren</Text>
            </TouchableOpacity>
            <Text style={styles.cancelHint}>
              Kosteloos annuleren is mogelijk tot 24 uur voor aanvang.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Status card
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Generic card
  card: {
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
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  // Date & Time
  dateTimeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  dateIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dateValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 2,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.text,
    lineHeight: 20,
  },

  // Service
  serviceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },

  // Car info
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  carImagePlaceholder: {
    width: 60,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  carPhoto: {
    width: 60,
    height: 44,
    borderRadius: 8,
  },
  carLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  carName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },

  // Garage info
  garageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  garageName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  garageAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  garageAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  garageMapBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.secondary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  garageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  garageActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary + '12',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  garageActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  // Garage notes
  garageNotesCard: {
    backgroundColor: COLORS.secondary + '10',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  garageNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  garageNotesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  garageNotesText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  // Review button
  reviewButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 14,
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // Cancel section
  cancelSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  cancelButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.danger + '25',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  cancelText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  cancelHint: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 10,
    paddingHorizontal: 20,
  },
});
