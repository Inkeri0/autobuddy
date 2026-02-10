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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { fetchGarageById, createBooking } from '../services/garageService';

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

function getTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 17) slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

export default function BookingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { garageId, serviceId } = route.params || {};

  const [garage, setGarage] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [selectedService, setSelectedService] = useState(serviceId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');

  const days = getNextDays(7);
  const timeSlots = getTimeSlots();

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

    setBooking(true);
    try {
      await createBooking({
        user_id: user.id,
        garage_id: garage.id,
        service_id: selectedService,
        date: selectedDate,
        time_slot: selectedTime,
        car_brand: carBrand || undefined,
        car_model: carModel || undefined,
        car_year: carYear ? parseInt(carYear) : undefined,
        car_license_plate: licensePlate || undefined,
        car_mileage: mileage ? parseInt(mileage) : undefined,
        notes: notes || undefined,
      });

      const service = services.find((s) => s.id === selectedService);
      Alert.alert(
        'Afspraak bevestigd! ✓',
        `${service?.name} bij ${garage.name}\n${selectedDate} om ${selectedTime}\n\nJe ontvangt een bevestiging per e-mail.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (err: any) {
      Alert.alert('Fout', err.message || 'Er is iets misgegaan bij het boeken.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Afspraak maken</Text>
      <Text style={styles.garageName}>{garage.name}</Text>

      <Text style={styles.sectionTitle}>Kies een service</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {services.map((service) => (
          <TouchableOpacity key={service.id} style={[styles.serviceChip, selectedService === service.id && styles.chipActive]} onPress={() => setSelectedService(service.id)}>
            <Text style={[styles.serviceChipText, selectedService === service.id && { color: COLORS.white }]}>{service.name}</Text>
            <Text style={[styles.serviceChipPrice, selectedService === service.id && { color: COLORS.white }]}>€{service.price_from} – €{service.price_to}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Kies een datum</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {days.map((day) => (
          <TouchableOpacity key={day.date} style={[styles.dateChip, selectedDate === day.date && styles.chipActive]} onPress={() => setSelectedDate(day.date)}>
            <Text style={[styles.dateChipText, selectedDate === day.date && { color: COLORS.white }]}>{day.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Kies een tijd</Text>
      <View style={styles.timeGrid}>
        {timeSlots.map((slot) => (
          <TouchableOpacity key={slot} style={[styles.timeChip, selectedTime === slot && styles.chipActive]} onPress={() => setSelectedTime(slot)}>
            <Text style={[styles.timeChipText, selectedTime === slot && { color: COLORS.white }]}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Auto gegevens (optioneel)</Text>
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Merk" placeholderTextColor={COLORS.textLight} value={carBrand} onChangeText={setCarBrand} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Model" placeholderTextColor={COLORS.textLight} value={carModel} onChangeText={setCarModel} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Bouwjaar" placeholderTextColor={COLORS.textLight} value={carYear} onChangeText={setCarYear} keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Kenteken" placeholderTextColor={COLORS.textLight} value={licensePlate} onChangeText={setLicensePlate} autoCapitalize="characters" />
        </View>
        <TextInput style={styles.input} placeholder="Km-stand" placeholderTextColor={COLORS.textLight} value={mileage} onChangeText={setMileage} keyboardType="numeric" />
        <TextInput style={[styles.input, { height: 80, paddingTop: 12 }]} placeholder="Opmerkingen" placeholderTextColor={COLORS.textLight} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />
      </View>

      {selectedService && selectedDate && selectedTime && (
        <View style={styles.summary}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 6 }}>Samenvatting</Text>
          <Text style={{ fontSize: 14, color: COLORS.text }}>{services.find((s) => s.id === selectedService)?.name} bij {garage.name}</Text>
          <Text style={{ fontSize: 14, color: COLORS.text }}>{days.find((d) => d.date === selectedDate)?.label} om {selectedTime}</Text>
        </View>
      )}

      <TouchableOpacity style={[styles.bookButton, booking && { opacity: 0.7 }]} onPress={handleBook} disabled={booking}>
        {booking ? <ActivityIndicator color={COLORS.white} /> : <Text style={{ color: COLORS.white, fontSize: 17, fontWeight: '700' }}>Afspraak bevestigen</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  garageName: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10, marginTop: 8 },
  serviceChip: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginRight: 10, borderWidth: 1.5, borderColor: COLORS.border, minWidth: 130 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  serviceChipText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  serviceChipPrice: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  dateChip: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderWidth: 1.5, borderColor: COLORS.border },
  dateChipText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  timeChip: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: COLORS.border },
  timeChipText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  input: { height: 46, backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, fontSize: 15, color: COLORS.text, marginBottom: 10 },
  summary: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 16, marginBottom: 16 },
  bookButton: { backgroundColor: COLORS.secondary, borderRadius: 12, padding: 16, alignItems: 'center' },
});
