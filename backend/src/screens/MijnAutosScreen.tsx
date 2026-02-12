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
  Modal,
  ScrollView,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import {
  fetchUserCars,
  createCar,
  updateCar,
  deleteCar,
  setDefaultCar,
  uploadCarPhoto,
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

/* ── Dutch license plate component ─────────────────────────── */
function LicensePlate({ plate }: { plate: string }) {
  return (
    <View style={plateStyles.wrapper}>
      <View style={plateStyles.blueStrip}>
        <Text style={plateStyles.nlText}>NL</Text>
      </View>
      <View style={plateStyles.yellowBg}>
        <Text style={plateStyles.plateText}>{plate}</Text>
      </View>
    </View>
  );
}

const plateStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    height: 36,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1a1a2e',
    overflow: 'hidden',
  },
  blueStrip: {
    width: 22,
    backgroundColor: '#003DA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nlText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  yellowBg: {
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  plateText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: 1.5,
  },
});

/* ── Main screen ───────────────────────────────────────────── */
export default function MijnAutosScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const isTab = route.name === 'MijnAuto';
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [form, setForm] = useState<CarForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null); // carId being uploaded

  const pickCarPhoto = async () => {
    const showPicker = async (source: 'camera' | 'library') => {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Geen toegang', 'Camera-toegang is nodig om een foto te maken.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Geen toegang', 'Galerij-toegang is nodig om een foto te kiezen.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuleren', 'Maak foto', 'Kies uit galerij'],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) showPicker('camera');
          if (idx === 2) showPicker('library');
        },
      );
    } else {
      Alert.alert('Foto kiezen', '', [
        { text: 'Maak foto', onPress: () => showPicker('camera') },
        { text: 'Kies uit galerij', onPress: () => showPicker('library') },
        { text: 'Annuleren', style: 'cancel' },
      ]);
    }
  };

  const handleUploadPhotoForCar = async (carId: string, uri: string) => {
    setUploadingPhoto(carId);
    try {
      await uploadCarPhoto(carId, uri);
      loadCars();
    } catch (err) {
      console.error('Failed to upload car photo:', err);
      Alert.alert('Fout', 'Kon foto niet uploaden.');
    } finally {
      setUploadingPhoto(null);
    }
  };

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
    setPhotoUri(null);
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
    setPhotoUri(car.photo_url || null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCarId(null);
    setForm(EMPTY_FORM);
    setPhotoUri(null);
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
      let carId = editingCarId;
      if (editingCarId) {
        await updateCar(editingCarId, {
          brand: form.brand.trim(),
          model: form.model.trim(),
          year: yearNum,
          license_plate: form.license_plate.trim().toUpperCase(),
          mileage: form.mileage ? parseInt(form.mileage, 10) : undefined,
        });
      } else {
        const newCar = await createCar({
          user_id: user.id,
          brand: form.brand.trim(),
          model: form.model.trim(),
          year: yearNum,
          license_plate: form.license_plate.trim().toUpperCase(),
          mileage: form.mileage ? parseInt(form.mileage, 10) : undefined,
          is_default: cars.length === 0,
        });
        carId = newCar.id;
      }
      // Upload photo if a new local photo was picked
      if (photoUri && carId && !photoUri.startsWith('http')) {
        await uploadCarPhoto(carId, photoUri);
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
      {/* Top row: photo/icon + info + badge */}
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <TouchableOpacity
            style={[
              styles.carIconCircle,
              item.photo_url && styles.carPhotoCircle,
              !item.photo_url && item.is_default && { backgroundColor: COLORS.secondary + '15' },
            ]}
            onPress={() => {
              // Quick upload from the card
              const doUpload = async (source: 'camera' | 'library') => {
                const perm = source === 'camera'
                  ? await ImagePicker.requestCameraPermissionsAsync()
                  : await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!perm.granted) {
                  Alert.alert('Geen toegang', 'Toegang is nodig om een foto te kiezen.');
                  return;
                }
                const launch = source === 'camera'
                  ? ImagePicker.launchCameraAsync
                  : ImagePicker.launchImageLibraryAsync;
                const result = await launch({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
                if (!result.canceled) handleUploadPhotoForCar(item.id, result.assets[0].uri);
              };
              if (Platform.OS === 'ios') {
                ActionSheetIOS.showActionSheetWithOptions(
                  { options: ['Annuleren', 'Maak foto', 'Kies uit galerij'], cancelButtonIndex: 0 },
                  (idx) => { if (idx === 1) doUpload('camera'); if (idx === 2) doUpload('library'); },
                );
              } else {
                Alert.alert('Foto kiezen', '', [
                  { text: 'Maak foto', onPress: () => doUpload('camera') },
                  { text: 'Kies uit galerij', onPress: () => doUpload('library') },
                  { text: 'Annuleren', style: 'cancel' },
                ]);
              }
            }}
            activeOpacity={0.7}
          >
            {uploadingPhoto === item.id ? (
              <ActivityIndicator size="small" color={COLORS.secondary} />
            ) : item.photo_url ? (
              <Image source={{ uri: item.photo_url }} style={styles.carPhoto} />
            ) : (
              <MaterialCommunityIcons
                name="car"
                size={28}
                color={item.is_default ? COLORS.secondary : COLORS.textLight}
              />
            )}
            <View style={styles.cameraIconBadge}>
              <MaterialCommunityIcons name="camera" size={10} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.carName}>
              {item.brand} {item.model}
            </Text>
            {item.mileage ? (
              <Text style={styles.carMileage}>
                Kilometerstand: {item.mileage.toLocaleString('nl-NL')} km
              </Text>
            ) : null}
          </View>
        </View>

        {/* Default badge or "Maak standaard" button */}
        {item.is_default ? (
          <View style={styles.defaultBadge}>
            <MaterialCommunityIcons name="star" size={12} color={COLORS.white} />
            <Text style={styles.defaultBadgeText}>STANDAARD</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.makeDefaultBtn}
            onPress={() => handleSetDefault(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.makeDefaultText}>Maak{'\n'}standaard</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* License plate */}
      <View style={{ marginTop: 14, marginBottom: 6 }}>
        <LicensePlate plate={item.license_plate} />
      </View>

      {/* Action buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            navigation.navigate('Onderhoudshistorie', {
              licensePlate: item.license_plate,
              carName: `${item.brand} ${item.model}`,
            })
          }
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="history" size={15} color={COLORS.text} />
          <Text style={styles.actionBtnText}>Geschiedenis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => openEditForm(item)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="pencil" size={15} color={COLORS.text} />
          <Text style={styles.actionBtnText}>Bewerken</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={renderCar}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 8 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Custom header */}
            <View style={styles.customHeader}>
              {!isTab && (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="chevron-left" size={26} color={COLORS.text} />
                </TouchableOpacity>
              )}
              {isTab && <View style={{ width: 8 }} />}
              <Text style={styles.brandingText}>AUTOBUDDY</Text>
              <View style={{ width: isTab ? 8 : 40 }} />
            </View>
            <Text style={styles.pageTitle}>Mijn auto's</Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddForm}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Auto toevoegen</Text>
            </TouchableOpacity>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="car-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Geen auto's opgeslagen</Text>
            <Text style={styles.emptySubText}>
              Voeg je auto toe om sneller afspraken te maken.
            </Text>
          </View>
        }
      />

      {/* Add / Edit car modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent
        onRequestClose={closeForm}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeForm}
          />
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            {/* Drag handle */}
            <View style={styles.modalHandle} />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Header row */}
              <View style={styles.modalHeader}>
                <Text style={styles.formTitle}>
                  {editingCarId ? 'Auto bewerken' : 'Auto toevoegen'}
                </Text>
                <TouchableOpacity onPress={closeForm} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              {/* Photo picker */}
              <TouchableOpacity
                style={styles.photoPickerBtn}
                onPress={pickCarPhoto}
                activeOpacity={0.7}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus" size={28} color={COLORS.textLight} />
                    <Text style={styles.photoPlaceholderText}>Foto toevoegen</Text>
                  </View>
                )}
              </TouchableOpacity>

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

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.formButton, { backgroundColor: COLORS.border }]}
                  onPress={closeForm}
                >
                  <Text style={{ color: COLORS.text, fontWeight: '600' }}>
                    Annuleren
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, { backgroundColor: COLORS.secondary }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={{ color: COLORS.white, fontWeight: '700' }}>
                      {editingCarId ? 'Opslaan' : 'Toevoegen'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },

  // Custom header
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  brandingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 18,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },

  // Car icon circle
  carIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  carPhotoCircle: {
    backgroundColor: COLORS.border,
  },
  carPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  // Photo picker in form
  photoPickerBtn: {
    alignSelf: 'center',
    marginBottom: 18,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 4,
  },

  // Car info
  carName: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
  },
  carMileage: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  // Default badge
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // "Maak standaard" button
  makeDefaultBtn: {
    backgroundColor: COLORS.secondary + '12',
    borderWidth: 1,
    borderColor: COLORS.secondary + '25',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  makeDefaultText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },

  // Action buttons row
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.background,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  deleteBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.danger + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Add button
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingVertical: 16,
    marginBottom: 18,
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 10,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  // Empty state
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
