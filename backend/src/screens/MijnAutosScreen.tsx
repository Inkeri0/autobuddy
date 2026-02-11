import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import {
  fetchUserCars,
  createCar,
  updateCar,
  deleteCar,
  setDefaultCar,
} from '../services/garageService';
import { Car } from '../types';

interface CarForm {
  brand: string;
  model: string;
  year: string;
  license_plate: string;
  mileage: string;
}

const EMPTY_FORM: CarForm = {
  brand: '',
  model: '',
  year: '',
  license_plate: '',
  mileage: '',
};

export default function MijnAutosScreen() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [form, setForm] = useState<CarForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadCars = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchUserCars(user.id);
      setCars(data);
    } catch (err) {
      console.error('Failed to load cars:', err);
      Alert.alert('Fout', 'Kon auto\'s niet laden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCars();
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingCarId(null);
    setShowForm(true);
  };

  const openEditForm = (car: Car) => {
    setForm({
      brand: car.brand,
      model: car.model,
      year: String(car.year),
      license_plate: car.license_plate,
      mileage: car.mileage ? String(car.mileage) : '',
    });
    setEditingCarId(car.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCarId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.brand.trim() || !form.model.trim() || !form.year.trim() || !form.license_plate.trim()) {
      Alert.alert('Vul alle velden in', 'Merk, model, bouwjaar en kenteken zijn verplicht.');
      return;
    }

    const yearNum = parseInt(form.year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert('Ongeldig bouwjaar', 'Voer een geldig bouwjaar in.');
      return;
    }

    setSaving(true);
    try {
      if (editingCarId) {
        await updateCar(editingCarId, {
          brand: form.brand.trim(),
          model: form.model.trim(),
          year: yearNum,
          license_plate: form.license_plate.trim().toUpperCase(),
          mileage: form.mileage ? parseInt(form.mileage, 10) : undefined,
        });
      } else {
        await createCar({
          user_id: user.id,
          brand: form.brand.trim(),
          model: form.model.trim(),
          year: yearNum,
          license_plate: form.license_plate.trim().toUpperCase(),
          mileage: form.mileage ? parseInt(form.mileage, 10) : undefined,
          is_default: cars.length === 0,
        });
      }
      closeForm();
      loadCars();
    } catch (err) {
      console.error('Failed to save car:', err);
      Alert.alert('Fout', 'Kon auto niet opslaan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (car: Car) => {
    Alert.alert(
      'Auto verwijderen',
      `Weet je zeker dat je ${car.brand} ${car.model} wilt verwijderen?`,
      [
        { text: 'Nee', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCar(car.id);
              loadCars();
            } catch (err) {
              console.error('Failed to delete car:', err);
              Alert.alert('Fout', 'Kon auto niet verwijderen.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (car: Car) => {
    if (!user || car.is_default) return;
    try {
      await setDefaultCar(user.id, car.id);
      loadCars();
    } catch (err) {
      console.error('Failed to set default car:', err);
      Alert.alert('Fout', 'Kon standaard auto niet instellen.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderCar = ({ item }: { item: Car }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.carName}>
              {item.brand} {item.model}
            </Text>
            {item.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Standaard</Text>
              </View>
            )}
          </View>
          <Text style={styles.carDetails}>
            {item.year} · {item.license_plate}
          </Text>
          {item.mileage && (
            <Text style={styles.carMileage}>
              {item.mileage.toLocaleString()} km
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 32 }}>🚗</Text>
      </View>

      <View style={styles.cardActions}>
        {!item.is_default && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item)}
          >
            <Text style={styles.actionText}>Standaard maken</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditForm(item)}
        >
          <Text style={styles.actionText}>Bewerken</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: COLORS.danger }]}
          onPress={() => handleDelete(item)}
        >
          <Text style={[styles.actionText, { color: COLORS.danger }]}>
            Verwijderen
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingCarId ? 'Auto bewerken' : 'Auto toevoegen'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Merk (bijv. BMW)"
            placeholderTextColor={COLORS.textLight}
            value={form.brand}
            onChangeText={(v) => setForm({ ...form, brand: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Model (bijv. 3 Serie)"
            placeholderTextColor={COLORS.textLight}
            value={form.model}
            onChangeText={(v) => setForm({ ...form, model: v })}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Bouwjaar"
              placeholderTextColor={COLORS.textLight}
              value={form.year}
              onChangeText={(v) => setForm({ ...form, year: v })}
              keyboardType="number-pad"
              maxLength={4}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Kenteken"
              placeholderTextColor={COLORS.textLight}
              value={form.license_plate}
              onChangeText={(v) => setForm({ ...form, license_plate: v })}
              autoCapitalize="characters"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Km-stand (optioneel)"
            placeholderTextColor={COLORS.textLight}
            value={form.mileage}
            onChangeText={(v) => setForm({ ...form, mileage: v })}
            keyboardType="number-pad"
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <TouchableOpacity
              style={[styles.formButton, { backgroundColor: COLORS.border }]}
              onPress={closeForm}
            >
              <Text style={{ color: COLORS.text, fontWeight: '600' }}>
                Annuleren
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, { backgroundColor: COLORS.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={{ color: COLORS.white, fontWeight: '600' }}>
                  {editingCarId ? 'Opslaan' : 'Toevoegen'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={renderCar}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          !showForm ? (
            <TouchableOpacity style={styles.addButton} onPress={openAddForm}>
              <Text style={styles.addButtonText}>+ Auto toevoegen</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          !showForm ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🚗</Text>
              <Text style={styles.emptyText}>Geen auto's opgeslagen</Text>
              <Text style={styles.emptySubText}>
                Voeg je auto toe om sneller afspraken te maken.
              </Text>
            </View>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
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
  },
  carName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  carDetails: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  carMileage: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  defaultBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  defaultText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  actionText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  addButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 8,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
