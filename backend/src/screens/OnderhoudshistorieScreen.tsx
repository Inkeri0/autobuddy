import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SERVICE_LABELS } from '../constants';
import { ServiceCategory, Car } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
  fetchMaintenanceHistory,
  fetchMaintenanceForCar,
  fetchUserCars,
} from '../services/garageService';

// ============================================
// HELPERS
// ============================================

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatMileage(km: number): string {
  return km.toLocaleString('nl-NL');
}

function getServiceLabel(record: any): string {
  const category = record.bookings?.garage_services?.category;
  if (category && SERVICE_LABELS[category as ServiceCategory]) {
    return SERVICE_LABELS[category as ServiceCategory];
  }
  const serviceName = record.bookings?.garage_services?.name;
  return serviceName || 'Onderhoud';
}

// ============================================
// DUTCH LICENSE PLATE
// ============================================

function LicensePlate({ plate }: { plate: string }) {
  return (
    <View style={plateStyles.container}>
      <View style={plateStyles.blueStrip}>
        <Text style={plateStyles.nlText}>NL</Text>
      </View>
      <View style={plateStyles.plateBody}>
        <Text style={plateStyles.plateText}>{plate}</Text>
      </View>
    </View>
  );
}

const plateStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00000020',
    alignSelf: 'flex-start',
  },
  blueStrip: {
    backgroundColor: '#003DA5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  nlText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
  plateBody: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  plateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
});

// ============================================
// MAIN SCREEN
// ============================================

export default function OnderhoudshistorieScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const initialPlate: string | undefined = route.params?.licensePlate;

  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showCarPicker, setShowCarPicker] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load user's cars first, then select the right one
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const userCars = await fetchUserCars(user.id);
        setCars(userCars);
        // If a specific plate was passed (from Mijn Auto's), select that car
        if (initialPlate) {
          const match = userCars.find((c: Car) => c.license_plate === initialPlate);
          setSelectedCar(match || userCars[0] || null);
        } else {
          // Default to the default car, or first car
          const defaultCar = userCars.find((c: Car) => c.is_default);
          setSelectedCar(defaultCar || userCars[0] || null);
        }
      } catch (err) {
        console.error('Failed to load cars:', err);
      }
    })();
  }, [user, initialPlate]);

  const loadRecords = useCallback(async () => {
    if (!user) return;
    try {
      const data = selectedCar
        ? await fetchMaintenanceForCar(user.id, selectedCar.license_plate)
        : await fetchMaintenanceHistory(user.id);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load maintenance history:', err);
      setRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedCar]);

  useEffect(() => {
    setLoading(true);
    loadRecords();
  }, [loadRecords]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };

  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
    setShowCarPicker(false);
    setExpandedId(null);
  };

  // Derived data
  const latestMileage = selectedCar?.mileage || (records.length > 0 ? records[0]?.mileage : 0) || 0;
  const totalRecords = records.length;
  const nextApkDate = records.find((r) => r.next_apk_date)?.next_apk_date;
  const apkDaysLeft = nextApkDate ? daysUntil(nextApkDate) : null;

  const displayCarName = selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'Mijn Auto';
  const displayPlate = selectedCar?.license_plate || '';
  const displayYear = selectedCar?.year || '';
  const carPhotoUrl = selectedCar?.photo_url || null;

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Onderhoudshistorie</Text>
          <TouchableOpacity
            style={styles.headerBtnFilter}
            activeOpacity={0.7}
            onPress={() => cars.length > 1 && setShowCarPicker(true)}
          >
            <MaterialCommunityIcons name="car-select" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Vehicle Profile Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleCardTop}>
            {/* Car image */}
            <View style={styles.carImageWrapper}>
              <View style={[styles.carImage, carPhotoUrl && styles.carImageWithPhoto]}>
                {carPhotoUrl ? (
                  <Image source={{ uri: carPhotoUrl }} style={styles.carImagePhoto} />
                ) : (
                  <MaterialCommunityIcons name="car-side" size={36} color={COLORS.secondary} />
                )}
              </View>
              <View style={styles.statusDot} />
            </View>
            <View style={styles.carDetails}>
              <Text style={styles.carNameText}>{displayCarName}</Text>
              <Text style={styles.carTypeText}>
                {displayYear ? `Bouwjaar ${displayYear}` : ''}
              </Text>
              {displayPlate ? (
                <View style={{ marginTop: 8 }}>
                  <LicensePlate plate={displayPlate} />
                </View>
              ) : null}
            </View>
          </View>

          {/* APK Alert Banner */}
          {apkDaysLeft !== null && (
            <View style={[
              styles.apkBanner,
              { backgroundColor: apkDaysLeft <= 0 ? COLORS.danger : COLORS.secondary },
            ]}>
              <View style={styles.apkBannerLeft}>
                <MaterialCommunityIcons
                  name={apkDaysLeft <= 0 ? 'alert-circle' : 'bell-alert'}
                  size={16}
                  color={COLORS.white}
                />
                <Text style={styles.apkBannerText}>
                  {apkDaysLeft <= 0
                    ? 'APK is verlopen!'
                    : `APK vervalt over ${apkDaysLeft} dagen`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.apkBannerBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Search', { serviceCategory: 'apk' })}
              >
                <Text style={styles.apkBannerBtnText}>PLAN NU</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>LAATSTE KM-STAND</Text>
            <Text style={styles.statValue}>
              {formatMileage(latestMileage)} <Text style={styles.statUnit}>km</Text>
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>BEURTEN TOTAAL</Text>
            <Text style={styles.statValue}>
              {totalRecords} <Text style={styles.statUnit}>items</Text>
            </Text>
          </View>
        </View>

        {/* Timeline */}
        {records.length > 0 ? (
          <View style={styles.timeline}>
            {/* Vertical line */}
            <View style={styles.timelineLine} />

            {records.map((item, index) => {
              const isFirst = index === 0;
              const isExpanded = expandedId === item.id;
              const garageName = item.garages?.name || 'Onbekende garage';
              const garageCity = item.garages?.city || '';
              const workItems = item.work_description
                ? item.work_description.split('\n').filter((l: string) => l.trim())
                : [];

              return (
                <View key={item.id} style={[styles.timelineItem, !isFirst && { opacity: 0.92 }]}>
                  {/* Timeline dot */}
                  <View style={styles.dotContainer}>
                    {isFirst ? (
                      <View style={styles.dotPrimaryOuter}>
                        <View style={styles.dotPrimaryInner}>
                          <View style={styles.dotPrimaryCore} />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.dotSecondary}>
                        <View style={styles.dotSecondaryCore} />
                      </View>
                    )}
                  </View>

                  {/* Card */}
                  <TouchableOpacity
                    style={[
                      styles.timelineCard,
                      isFirst && styles.timelineCardFirst,
                    ]}
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                    activeOpacity={0.97}
                  >
                    {/* Card header */}
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardDate, isFirst && styles.cardDateFirst]}>
                          {formatDateShort(item.service_date)}
                        </Text>
                        <Text style={styles.cardServiceName}>{getServiceLabel(item)}</Text>
                      </View>
                      <MaterialCommunityIcons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={COLORS.textLight}
                      />
                    </View>

                    {/* Mileage + Garage row */}
                    <View style={styles.cardInfoRow}>
                      <View style={styles.cardInfoItem}>
                        <MaterialCommunityIcons name="speedometer" size={16} color={COLORS.textLight} />
                        <Text style={styles.cardInfoBold}>{formatMileage(item.mileage)} km</Text>
                      </View>
                      <View style={styles.cardInfoItem}>
                        <MaterialCommunityIcons name="garage" size={16} color={COLORS.textLight} />
                        <Text style={styles.cardInfoText} numberOfLines={1}>
                          {garageName}{garageCity ? ` ${garageCity}` : ''}
                        </Text>
                      </View>
                    </View>

                    {/* Expanded work items */}
                    {isExpanded && workItems.length > 0 && (
                      <View style={styles.workSection}>
                        {workItems.map((line: string, i: number) => (
                          <View key={i} style={styles.workItem}>
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={14}
                              color={COLORS.success}
                            />
                            <Text style={styles.workText}>{line.trim()}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={44} color={COLORS.secondary} />
            </View>
            <Text style={styles.emptyText}>Nog geen onderhoudshistorie</Text>
            <Text style={styles.emptySubText}>
              Onderhoudsgegevens worden toegevoegd door garages wanneer ze jouw afspraak afronden.
            </Text>
          </View>
        )}

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Car Picker Modal */}
      <Modal
        visible={showCarPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCarPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowCarPicker(false)}
        />
        <View style={[styles.pickerContent, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.pickerHandle} />
          <Text style={styles.pickerTitle}>Selecteer auto</Text>
          {cars.map((car) => {
            const isActive = selectedCar?.id === car.id;
            return (
              <TouchableOpacity
                key={car.id}
                style={[styles.pickerItem, isActive && styles.pickerItemActive]}
                onPress={() => handleSelectCar(car)}
                activeOpacity={0.7}
              >
                <View style={[styles.pickerCarIcon, car.photo_url && styles.pickerCarIconPhoto]}>
                  {car.photo_url ? (
                    <Image source={{ uri: car.photo_url }} style={styles.pickerCarImage} />
                  ) : (
                    <MaterialCommunityIcons name="car" size={22} color={isActive ? COLORS.secondary : COLORS.textLight} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pickerCarName, isActive && { color: COLORS.secondary }]}>
                    {car.brand} {car.model}
                  </Text>
                  <Text style={styles.pickerCarPlate}>{car.license_plate}</Text>
                </View>
                {car.is_default && (
                  <View style={styles.pickerDefaultBadge}>
                    <Text style={styles.pickerDefaultText}>STANDAARD</Text>
                  </View>
                )}
                {isActive && (
                  <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.secondary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.secondary + '10',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerBtnFilter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.secondary + '10',
  },

  // Vehicle Profile Card
  vehicleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.secondary + '15',
    marginBottom: 16,
  },
  vehicleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  carImageWrapper: {
    position: 'relative',
  },
  carImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.secondary + '20',
    overflow: 'hidden',
  },
  carImageWithPhoto: {
    backgroundColor: COLORS.border,
  },
  carImagePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  carDetails: {
    flex: 1,
  },
  carNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
  },
  carTypeText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // APK Banner
  apkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  apkBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  apkBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  apkBannerBtn: {
    backgroundColor: '#ffffff30',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  apkBannerBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.secondary + '08',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary + '15',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // Timeline
  timeline: {
    position: 'relative',
    paddingBottom: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 23,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: COLORS.secondary + '20',
    borderRadius: 1,
  },

  // Timeline items
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dotContainer: {
    width: 48,
    alignItems: 'center',
    paddingTop: 6,
  },

  // First record: larger prominent dot
  dotPrimaryOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary + '25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotPrimaryInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotPrimaryCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },

  // Other records: smaller muted dot
  dotSecondary: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotSecondaryCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },

  // Timeline card
  timelineCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.secondary + '08',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  timelineCardFirst: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderColor: COLORS.secondary + '12',
  },

  // Card content
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardDateFirst: {
    color: COLORS.secondary,
  },
  cardServiceName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  cardInfoRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 20,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cardInfoBold: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardInfoText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Expanded work items
  workSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  workItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.secondary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },

  // Car Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  pickerContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  pickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    gap: 12,
  },
  pickerItemActive: {
    backgroundColor: COLORS.secondary + '10',
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  pickerCarIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pickerCarIconPhoto: {
    backgroundColor: 'transparent',
  },
  pickerCarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  pickerCarName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  pickerCarPlate: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 2,
  },
  pickerDefaultBadge: {
    backgroundColor: COLORS.secondary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pickerDefaultText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
});
