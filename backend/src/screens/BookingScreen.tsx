import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { fetchGarageById, createBooking, fetchUserCars, fetchUnavailableSlots } from '../services/garageService';
import { Car } from '../types';

function getNextDays(count: number) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      label: i === 0 ? 'Vandaag' : i === 1 ? 'Morgen' : date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }
  return days;
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getTimeSlotsForGarage(garage: any, dateStr: string): string[] {
  if (!dateStr) return [];

  const date = new Date(dateStr + 'T00:00:00');
  const dayKey = DAY_KEYS[date.getDay()];
  const hours = garage?.opening_hours?.[dayKey];

  if (hours?.closed) return [];

  const openTime = hours?.open || '08:00';
  const closeTime = hours?.close || '17:30';
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  const openTotal = openHour * 60 + (openMin || 0);
  const closeTotal = closeHour * 60 + (closeMin || 0);

  const slots: string[] = [];
  for (let hour = openHour; hour <= closeHour; hour++) {
    for (const min of [0, 30]) {
      const total = hour * 60 + min;
      if (total >= openTotal && total < closeTotal) {
        slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      }
    }
  }
  return slots;
}

function isDayClosed(garage: any, dateStr: string): boolean {
  if (!garage?.opening_hours) return false;
  const date = new Date(dateStr + 'T00:00:00');
  const dayKey = DAY_KEYS[date.getDay()];
  return !!garage.opening_hours[dayKey]?.closed;
}

function isSlotInPast(dateStr: string, slot: string): boolean {
  const today = new Date();
  if (dateStr !== today.toISOString().split('T')[0]) return false;
  const [hour, min] = slot.split(':').map(Number);
  return hour * 60 + min <= today.getHours() * 60 + today.getMinutes();
}

export default function BookingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { garageId, serviceId } = route.params || {};

  const [garage, setGarage] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [selectedService, setSelectedService] = useState(serviceId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  // Car selection
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [carsLoading, setCarsLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const days = getNextDays(7);
  const timeSlots = garage && selectedDate ? getTimeSlotsForGarage(garage, selectedDate) : [];

  useEffect(() => {
    if (garageId) {
      fetchGarageById(garageId)
        .then((data) => {
          setGarage(data.garage);
          setServices(data.services);
          if (serviceId && data.services.some((s: any) => s.id === serviceId)) {
            setSelectedService(serviceId);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [garageId]);

  // Load user's saved cars
  useEffect(() => {
    if (user?.id) {
      fetchUserCars(user.id)
        .then((data) => {
          setUserCars(data);
          // Auto-select the default car
          const defaultCar = data.find((c: Car) => c.is_default);
          if (defaultCar) setSelectedCarId(defaultCar.id);
        })
        .catch(() => {})
        .finally(() => setCarsLoading(false));
    }
  }, [user]);

  // Fetch booked + blocked slots when date changes
  useEffect(() => {
    if (!garageId || !selectedDate) {
      setBookedSlots([]);
      setBlockedSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSelectedTime('');
    fetchUnavailableSlots(garageId, selectedDate)
      .then(({ booked, blocked }) => {
        setBookedSlots(booked);
        setBlockedSlots(blocked);
      })
      .catch(() => {
        setBookedSlots([]);
        setBlockedSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [garageId, selectedDate]);

  const selectedCar = userCars.find((c) => c.id === selectedCarId) || null;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!garage) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: COLORS.danger }}>Garage niet gevonden</Text>
      </View>
    );
  }

  const handleBook = async () => {
    if (!selectedService) { Alert.alert('Kies een service', 'Selecteer welke service je wilt boeken.'); return; }
    if (!selectedDate) { Alert.alert('Kies een datum', 'Selecteer een dag voor je afspraak.'); return; }
    if (!selectedTime) { Alert.alert('Kies een tijd', 'Selecteer een tijdslot.'); return; }
    if (!user?.id) { Alert.alert('Niet ingelogd', 'Log eerst in om een afspraak te maken.'); return; }
    if (!selectedCar) { Alert.alert('Selecteer een auto', 'Kies een auto of voeg er eerst een toe.'); return; }

    setBooking(true);
    try {
      await createBooking({
        user_id: user.id,
        garage_id: garage.id,
        service_id: selectedService,
        date: selectedDate,
        time_slot: selectedTime,
        car_brand: selectedCar.brand,
        car_model: selectedCar.model,
        car_year: selectedCar.year,
        car_license_plate: selectedCar.license_plate,
        car_mileage: selectedCar.mileage || undefined,
        notes: notes || undefined,
      });

      const service = services.find((s) => s.id === selectedService);
      Alert.alert(
        'Afspraak bevestigd!',
        `${service?.name} bij ${garage.name}\n${selectedDate} om ${selectedTime}\n\nJe ontvangt een bevestiging per e-mail.`,
        [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }) }]
      );
    } catch (err: any) {
      Alert.alert('Fout', err.message || 'Er is iets misgegaan bij het boeken.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: 0 }]}>
      {/* Custom header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Afspraak maken</Text>
        <View style={{ width: 40 }} />
      </View>
      <Text style={styles.garageName}>{garage.name}</Text>

      <Text style={styles.sectionTitle}>Kies een service</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {services.map((service) => (
          <TouchableOpacity key={service.id} style={[styles.serviceChip, selectedService === service.id && styles.chipActive]} onPress={() => setSelectedService(service.id)}>
            <Text style={[styles.serviceChipText, selectedService === service.id && { color: COLORS.white }]}>{service.name}</Text>
            <Text style={[styles.serviceChipPrice, selectedService === service.id && { color: COLORS.white }]}>{'\u20AC'}{service.price_from} – {'\u20AC'}{service.price_to}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Kies een datum</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {days.map((day) => {
          const closed = isDayClosed(garage, day.date);
          return (
            <TouchableOpacity
              key={day.date}
              style={[styles.dateChip, selectedDate === day.date && styles.chipActive, closed && styles.chipDisabled]}
              onPress={() => !closed && setSelectedDate(day.date)}
              disabled={closed}
            >
              <Text style={[styles.dateChipText, selectedDate === day.date && { color: COLORS.white }, closed && { color: COLORS.textLight }]}>
                {day.label}
              </Text>
              {closed && <Text style={styles.closedLabel}>Gesloten</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Kies een tijd</Text>
      {slotsLoading ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} />
      ) : selectedDate && timeSlots.length === 0 ? (
        <Text style={styles.closedMessage}>Garage is gesloten op deze dag</Text>
      ) : (
        <View style={styles.timeGrid}>
          {timeSlots.map((slot) => {
            const isBooked = bookedSlots.includes(slot);
            const isBlocked = blockedSlots.includes(slot);
            const isPast = isSlotInPast(selectedDate, slot);
            const isDisabled = isBooked || isBlocked || isPast;
            return (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeChip,
                  selectedTime === slot && styles.chipActive,
                  isDisabled && styles.chipDisabled,
                  (isBooked || isBlocked) && styles.chipBooked,
                ]}
                onPress={() => setSelectedTime(slot)}
                disabled={isDisabled}
              >
                <Text style={[
                  styles.timeChipText,
                  selectedTime === slot && { color: COLORS.white },
                  isDisabled && styles.timeChipTextDisabled,
                  (isBooked || isBlocked) && styles.timeChipTextBooked,
                ]}>
                  {slot}
                </Text>
                {isBooked && <Text style={styles.bookedLabel}>Bezet</Text>}
                {isBlocked && <Text style={styles.blockedLabel}>Niet beschikbaar</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionTitle}>Selecteer je auto</Text>
      {carsLoading ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginBottom: 16 }} />
      ) : userCars.length === 0 ? (
        <View style={styles.noCarsBox}>
          <MaterialCommunityIcons name="car-outline" size={32} color={COLORS.textLight} />
          <Text style={styles.noCarsText}>Nog geen auto's opgeslagen</Text>
          <TouchableOpacity
            style={styles.addCarButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'MijnAuto' })}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
            <Text style={styles.addCarButtonText}>Auto toevoegen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginBottom: 16 }}>
          {userCars.map((car) => {
            const isSelected = selectedCarId === car.id;
            return (
              <TouchableOpacity
                key={car.id}
                style={[styles.carCard, isSelected && styles.carCardActive]}
                onPress={() => setSelectedCarId(car.id)}
                activeOpacity={0.7}
              >
                <View style={styles.carCardLeft}>
                  {car.photo_url ? (
                    <Image source={{ uri: car.photo_url }} style={styles.carCardPhoto} />
                  ) : (
                    <View style={[styles.carCardIcon, isSelected && { backgroundColor: COLORS.white + '20' }]}>
                      <MaterialCommunityIcons name="car" size={22} color={isSelected ? COLORS.white : COLORS.textLight} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.carCardName, isSelected && { color: COLORS.white }]}>
                      {car.brand} {car.model}
                    </Text>
                    <Text style={[styles.carCardPlate, isSelected && { color: COLORS.white + 'CC' }]}>
                      {car.license_plate} · {car.year}
                    </Text>
                    {car.mileage ? (
                      <Text style={[styles.carCardMileage, isSelected && { color: COLORS.white + '99' }]}>
                        {car.mileage.toLocaleString('nl-NL')} km
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={[styles.carCardRadio, isSelected && styles.carCardRadioActive]}>
                  {isSelected && <View style={styles.carCardRadioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.addCarLink}
            onPress={() => navigation.navigate('MainTabs', { screen: 'MijnAuto' })}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.addCarLinkText}>Andere auto toevoegen</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Opmerkingen</Text>
      <TextInput
        style={[styles.input, { height: 80, paddingTop: 12, marginBottom: 16 }]}
        placeholder="Extra informatie voor de garage (optioneel)"
        placeholderTextColor={COLORS.textLight}
        value={notes}
        onChangeText={setNotes}
        multiline
        textAlignVertical="top"
      />

      {selectedService && selectedDate && selectedTime && (
        <View style={styles.summary}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 }}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={COLORS.primary} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.primary }}>Samenvatting</Text>
          </View>
          <Text style={{ fontSize: 14, color: COLORS.text }}>{services.find((s) => s.id === selectedService)?.name} bij {garage.name}</Text>
          <Text style={{ fontSize: 14, color: COLORS.text }}>{days.find((d) => d.date === selectedDate)?.label} om {selectedTime}</Text>
          {selectedCar && (
            <Text style={{ fontSize: 14, color: COLORS.text }}>
              {selectedCar.brand} {selectedCar.model} · {selectedCar.license_plate}
              {selectedCar.mileage ? ` · ${selectedCar.mileage.toLocaleString('nl-NL')} km` : ''}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity style={[styles.bookButton, booking && { opacity: 0.7 }]} onPress={handleBook} disabled={booking}>
        {booking ? <ActivityIndicator color={COLORS.white} /> : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.white} />
            <Text style={{ color: COLORS.white, fontSize: 17, fontWeight: '700' }}>Afspraak bevestigen</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginHorizontal: -20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  garageName: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10, marginTop: 8 },
  serviceChip: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginRight: 10, borderWidth: 1.5, borderColor: COLORS.border, minWidth: 130 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipDisabled: { opacity: 0.5, backgroundColor: '#ebebeb', borderColor: '#d4d4d4' },
  chipBooked: { backgroundColor: '#f3f3f3', borderColor: '#d0d0d0', borderStyle: 'dashed' as const },
  closedLabel: { fontSize: 10, color: COLORS.danger, marginTop: 2 },
  bookedLabel: { fontSize: 9, color: COLORS.danger, fontWeight: '700' as const, marginTop: 2, letterSpacing: 0.3 },
  blockedLabel: { fontSize: 9, color: '#999', fontWeight: '600' as const, marginTop: 2 },
  timeChipTextDisabled: { color: '#b0b0b0' },
  timeChipTextBooked: { color: '#b0b0b0', textDecorationLine: 'line-through' as const },
  closedMessage: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' as const, paddingVertical: 16, marginBottom: 16 },
  serviceChipText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  serviceChipPrice: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  dateChip: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderWidth: 1.5, borderColor: COLORS.border },
  dateChipText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  timeChip: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' as const },
  timeChipText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  input: { height: 46, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, fontSize: 15, color: COLORS.text, marginBottom: 10 },
  summary: { backgroundColor: COLORS.primary + '10', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.primary + '25' },
  bookButton: { backgroundColor: COLORS.secondary, borderRadius: 14, padding: 16, alignItems: 'center' },

  // Car selector
  noCarsBox: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  noCarsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 14,
  },
  addCarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    gap: 6,
  },
  addCarButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  carCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  carCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  carCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  carCardPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
  },
  carCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  carCardPlate: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  carCardMileage: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 1,
  },
  carCardRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  carCardRadioActive: {
    borderColor: COLORS.white,
  },
  carCardRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  addCarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  addCarLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
});
