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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SERVICE_LABELS, AVAILABILITY_COLORS } from '../constants';
import { AvailabilityStatus, ServiceCategory, BookingStatus } from '../types';
import { fetchBookingById, cancelBooking } from '../services/garageService';
import StarDisplay from '../components/StarDisplay';

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

function formatDateNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function AfspraakDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingById(bookingId)
      .then(setBooking)
      .catch((err) => {
        console.error('Failed to load booking:', err);
        Alert.alert('Fout', 'Kon afspraak niet laden.');
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status banner */}
      <View style={[styles.statusBanner, { backgroundColor: STATUS_COLORS[status] + '15' }]}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
        <Text style={[styles.statusLabel, { color: STATUS_COLORS[status] }]}>
          {STATUS_LABELS[status]}
        </Text>
      </View>

      {/* Appointment details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Afspraak</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Datum</Text>
          <Text style={styles.value}>{formatDateNL(booking.date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tijd</Text>
          <Text style={styles.value}>{booking.time_slot}</Text>
        </View>
        {booking.notes && (
          <View style={styles.row}>
            <Text style={styles.label}>Opmerkingen</Text>
            <Text style={[styles.value, { flex: 1, textAlign: 'right' }]}>
              {booking.notes}
            </Text>
          </View>
        )}
      </View>

      {/* Service details */}
      {service && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{service.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Categorie</Text>
            <Text style={styles.value}>
              {SERVICE_LABELS[service.category as ServiceCategory] || service.category}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Prijsindicatie</Text>
            <Text style={[styles.value, { color: COLORS.primary, fontWeight: '700' }]}>
              €{service.price_from} – €{service.price_to}
            </Text>
          </View>
          {service.duration_minutes && (
            <View style={styles.row}>
              <Text style={styles.label}>Geschatte duur</Text>
              <Text style={styles.value}>ca. {service.duration_minutes} min</Text>
            </View>
          )}
          {service.description && (
            <View style={[styles.row, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <Text style={[styles.label, { marginBottom: 4 }]}>Beschrijving</Text>
              <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 20 }}>
                {service.description}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Car details */}
      {booking.car_brand && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Auto</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Voertuig</Text>
            <Text style={styles.value}>
              {booking.car_brand} {booking.car_model}
              {booking.car_year ? ` (${booking.car_year})` : ''}
            </Text>
          </View>
          {booking.car_license_plate && (
            <View style={styles.row}>
              <Text style={styles.label}>Kenteken</Text>
              <Text style={styles.value}>{booking.car_license_plate}</Text>
            </View>
          )}
          {booking.car_mileage && (
            <View style={styles.row}>
              <Text style={styles.label}>Km-stand</Text>
              <Text style={styles.value}>
                {booking.car_mileage.toLocaleString()} km
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Garage details */}
      {garage && (
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.cardTitle}>Garage</Text>
            <View style={styles.availabilityBadge}>
              <View style={[
                styles.availabilityDot,
                { backgroundColor: AVAILABILITY_COLORS[garage.availability_status as AvailabilityStatus] || COLORS.success },
              ]} />
              <Text style={styles.availabilityText}>
                {garage.availability_status === 'green' ? 'Veel plek' :
                 garage.availability_status === 'orange' ? 'Beperkt' : 'Vol vandaag'}
              </Text>
            </View>
          </View>

          <Text style={styles.garageName}>{garage.name}</Text>

          {garage.average_rating > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <StarDisplay rating={garage.average_rating} size={14} />
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginLeft: 6 }}>
                {garage.average_rating.toFixed(1)} ({garage.total_reviews} reviews)
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Adres</Text>
            <Text style={[styles.value, { flex: 1, textAlign: 'right' }]}>
              {garage.address}, {garage.postal_code} {garage.city}
            </Text>
          </View>

          {garage.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Telefoon</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${garage.phone}`)}>
                <Text style={[styles.value, { color: COLORS.secondary }]}>{garage.phone}</Text>
              </TouchableOpacity>
            </View>
          )}

          {garage.email && (
            <View style={styles.row}>
              <Text style={styles.label}>E-mail</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${garage.email}`)}>
                <Text style={[styles.value, { color: COLORS.secondary }]}>{garage.email}</Text>
              </TouchableOpacity>
            </View>
          )}

          {garage.brands_serviced?.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={[styles.label, { marginBottom: 8 }]}>Merken</Text>
              <View style={styles.tagRow}>
                {garage.brands_serviced.map((brand: string) => (
                  <View key={brand} style={styles.tag}>
                    <Text style={styles.tagText}>{brand}</Text>
                  </View>
                ))}
                {garage.is_ev_specialist && (
                  <View style={[styles.tag, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.tagText, { color: COLORS.success }]}>EV</Text>
                  </View>
                )}
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.garageButton}
            onPress={() => navigation.navigate('GarageDetail', { garageId: garage.id })}
          >
            <Text style={styles.garageButtonText}>Bekijk garage</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Garage notes */}
      {booking.garage_notes && (
        <View style={[styles.card, { backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.cardTitle, { color: COLORS.warning }]}>Notities van de garage</Text>
          <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 20 }}>
            {booking.garage_notes}
          </Text>
        </View>
      )}

      {/* Actions */}
      {status === 'completed' && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => navigation.navigate('Review', { bookingId })}
        >
          <Text style={styles.reviewButtonText}>Beoordeel deze afspraak</Text>
        </TouchableOpacity>
      )}

      {canCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Afspraak annuleren</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: { fontSize: 14, color: COLORS.textSecondary },
  value: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  garageName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  availabilityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  availabilityText: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: COLORS.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  garageButton: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  garageButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  reviewButton: {
    marginTop: 4,
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  cancelButton: {
    marginTop: 4,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    alignItems: 'center',
  },
  cancelText: { color: COLORS.danger, fontSize: 15, fontWeight: '600' },
});
