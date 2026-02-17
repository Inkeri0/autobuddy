import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Animated,
  PanResponder,
  Platform,
  Image,
} from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Marker, Callout, type Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, AVAILABILITY_COLORS, DEFAULT_MAP_REGION } from '../constants';
import { AvailabilityStatus } from '../types';
import { useGarages } from '../hooks/useGarages';
import { fetchBookingCountsByDate } from '../services/garageService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Date chip config
const DATE_CHIPS = [
  { key: 'today', label: 'Vandaag', offset: 0 },
  { key: 'tomorrow', label: 'Morgen', offset: 1 },
  { key: 'next_week', label: 'Volgende week', offset: 7 },
];

function getDateForOffset(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dayKey = DAY_KEYS[d.getDay()];
  return { date: `${yyyy}-${mm}-${dd}`, dayKey };
}

// Pin status based on bookings + open/closed
function getPinStatus(
  garage: any,
  dayKey: string,
  bookingCount: number,
): 'closed' | AvailabilityStatus {
  const hours = garage.opening_hours?.[dayKey];
  if (!hours || hours.closed) return 'closed';
  if (bookingCount >= 6) return 'red';
  if (bookingCount >= 3) return 'orange';
  return 'green';
}

const PIN_COLORS: Record<string, string> = {
  green: AVAILABILITY_COLORS.green,
  orange: AVAILABILITY_COLORS.orange,
  red: AVAILABILITY_COLORS.red,
  closed: '#9ca3af',
};

const STATUS_LABELS: Record<string, string> = {
  green: 'Beschikbaar',
  orange: 'Beperkt',
  red: 'Volgeboekt',
  closed: 'Gesloten',
};

// Custom map marker
function GarageMarker({ status }: { status: string }) {
  const bgColor = status === 'closed' ? COLORS.textLight : COLORS.primary;
  const iconName = status === 'closed'
    ? 'garage-alert'
    : status === 'red'
      ? 'car-off'
      : 'car';

  return (
    <View style={mkStyles.container}>
      <View style={[mkStyles.bubble, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={iconName as any} size={16} color={COLORS.white} />
      </View>
      <View style={[mkStyles.arrow, { borderTopColor: bgColor }]} />
    </View>
  );
}

const mkStyles = StyleSheet.create({
  container: { alignItems: 'center' },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
    marginTop: -2,
  },
});

// ============================================
// BOTTOM SHEET (built with Animated + PanResponder)
// ============================================

function DraggableBottomSheet({
  children,
  peekHeight,
  midHeight,
  fullHeight,
}: {
  children: React.ReactNode;
  peekHeight: number;
  midHeight: number;
  fullHeight: number;
}) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT - peekHeight)).current;
  const lastSnap = useRef(SCREEN_HEIGHT - peekHeight);
  const snapPoints = [SCREEN_HEIGHT - fullHeight, SCREEN_HEIGHT - midHeight, SCREEN_HEIGHT - peekHeight];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dy) > 8;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(lastSnap.current);
        translateY.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dy: translateY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        translateY.flattenOffset();
        const currentY = lastSnap.current + gesture.dy;

        // Find closest snap point
        let closest = snapPoints[0];
        let minDist = Infinity;
        for (const sp of snapPoints) {
          const dist = Math.abs(currentY - sp);
          if (dist < minDist) {
            minDist = dist;
            closest = sp;
          }
        }

        // If flinging, go in fling direction
        if (Math.abs(gesture.vy) > 0.5) {
          if (gesture.vy > 0) {
            // Fling down — find next snap below current
            closest = snapPoints.find((sp) => sp > currentY) || snapPoints[snapPoints.length - 1];
          } else {
            // Fling up — find next snap above current
            closest = [...snapPoints].reverse().find((sp) => sp < currentY) || snapPoints[0];
          }
        }

        lastSnap.current = closest;
        Animated.spring(translateY, {
          toValue: closest,
          useNativeDriver: false,
          tension: 80,
          friction: 12,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        sheetStyles.container,
        { transform: [{ translateY }] },
      ]}
    >
      {/* Draggable handle area */}
      <View {...panResponder.panHandlers}>
        <View style={sheetStyles.handleArea}>
          <View style={sheetStyles.handle} />
        </View>
      </View>
      {children}
    </Animated.View>
  );
}

const sheetStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  handleArea: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
});

// ============================================
// MAIN SCREEN
// ============================================

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { garages, loading } = useGarages();
  const [region, setRegion] = useState<Region>(DEFAULT_MAP_REGION);
  const mapRef = useRef<any>(null);

  const [selectedChip, setSelectedChip] = useState('today');
  const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});

  const selectedDateInfo = useMemo(() => {
    const chip = DATE_CHIPS.find((c) => c.key === selectedChip);
    return getDateForOffset(chip?.offset || 0);
  }, [selectedChip]);

  // Fetch booking counts when date changes
  useEffect(() => {
    let cancelled = false;
    fetchBookingCountsByDate(selectedDateInfo.date)
      .then((counts) => { if (!cancelled) setBookingCounts(counts); })
      .catch((err) => {
        console.error('Failed to load booking counts:', err);
        if (!cancelled) setBookingCounts({});
      });
    return () => { cancelled = true; };
  }, [selectedDateInfo.date]);

  // Bottom sheet snap heights
  const peekHeight = 280;
  const midHeight = SCREEN_HEIGHT * 0.55;
  const fullHeight = SCREEN_HEIGHT - insets.top - 60;

  // Filter garages visible in current map region
  const visibleGarages = useMemo(() => {
    return garages.filter((garage) => {
      const latMin = region.latitude - region.latitudeDelta / 2;
      const latMax = region.latitude + region.latitudeDelta / 2;
      const lngMin = region.longitude - region.longitudeDelta / 2;
      const lngMax = region.longitude + region.longitudeDelta / 2;
      return (
        garage.latitude >= latMin &&
        garage.latitude <= latMax &&
        garage.longitude >= lngMin &&
        garage.longitude <= lngMax
      );
    });
  }, [garages, region]);

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  const getGarageStatus = useCallback((garage: any) => {
    return getPinStatus(garage, selectedDateInfo.dayKey, bookingCounts[garage.id] || 0);
  }, [selectedDateInfo.dayKey, bookingCounts]);

  const handleMarkerPress = useCallback((garageId: string) => {
    setSelectedGarageId(garageId);
  }, []);

  const handleGarageCardPress = useCallback((garageId: string) => {
    navigation.navigate('GarageDetail', { garageId });
  }, [navigation]);

  const handleMyLocation = useCallback(() => {
    mapRef.current?.animateToRegion(DEFAULT_MAP_REGION, 500);
  }, []);

  return (
    <View style={styles.container}>
      {/* Full-screen Map */}
      {loading ? (
        <View style={styles.mapLoading}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Kaart laden...</Text>
        </View>
      ) : (
        <ClusteredMapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={DEFAULT_MAP_REGION}
          onRegionChangeComplete={handleRegionChangeComplete}
          clusterColor={COLORS.primary}
          clusterTextColor={COLORS.white}
          radius={40}
          mapRef={(ref: any) => { mapRef.current = ref; }}
          showsUserLocation
          showsMyLocationButton={false}
          mapPadding={{ top: insets.top + 140, right: 0, bottom: 300, left: 0 }}
        >
          {garages.map((garage) => {
            const status = getGarageStatus(garage);
            const isSelected = garage.id === selectedGarageId;
            return (
              <Marker
                key={garage.id}
                identifier={garage.id}
                coordinate={{
                  latitude: garage.latitude,
                  longitude: garage.longitude,
                }}
                onPress={() => handleMarkerPress(garage.id)}
                tracksViewChanges={false}
              >
                <View style={isSelected ? { transform: [{ scale: 1.2 }] } : undefined}>
                  <GarageMarker status={status} />
                </View>
                <Callout onPress={() => handleGarageCardPress(garage.id)}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutName}>{garage.name}</Text>
                    <Text style={styles.calloutCity}>{garage.city}</Text>
                    <View style={styles.calloutRow}>
                      <Text style={styles.calloutRating}>
                        ★ {(garage.average_rating || 0).toFixed(1)}
                      </Text>
                      <Text style={[styles.calloutStatus, { color: PIN_COLORS[status] }]}>
                        {STATUS_LABELS[status]}
                      </Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </ClusteredMapView>
      )}

      {/* Floating Header */}
      <View style={[styles.floatingHeader, { top: insets.top + 8 }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kaart</Text>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="magnify" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Date filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {DATE_CHIPS.map((chip) => {
            const isActive = selectedChip === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
                onPress={() => setSelectedChip(chip.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateChipText, isActive && styles.dateChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Map controls (right side) */}
      <View style={[styles.mapControls, { bottom: peekHeight + 20 }]}>
        <TouchableOpacity
          style={styles.mapControlBtn}
          onPress={handleMyLocation}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Draggable Bottom Sheet */}
      <DraggableBottomSheet
        peekHeight={peekHeight}
        midHeight={midHeight}
        fullHeight={fullHeight}
      >
        {/* Sheet header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Dichtbij in de buurt</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}
          >
            <Text style={styles.sheetShowAll}>Toon alles</Text>
          </TouchableOpacity>
        </View>

        {/* Garage cards */}
        <ScrollView
          contentContainerStyle={styles.sheetList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {visibleGarages.length > 0 ? (
            visibleGarages.map((garage) => {
              const status = getGarageStatus(garage);
              const isSelected = garage.id === selectedGarageId;
              const isClosed = status === 'closed';

              return (
                <TouchableOpacity
                  key={garage.id}
                  style={[
                    styles.garageCard,
                    isSelected && styles.garageCardSelected,
                    isClosed && styles.garageCardClosed,
                  ]}
                  onPress={() => handleGarageCardPress(garage.id)}
                  activeOpacity={0.95}
                >
                  <View style={styles.cardRow}>
                    {/* Garage logo or placeholder */}
                    <View style={styles.cardImage}>
                      {garage.logo_url ? (
                        <Image
                          source={{ uri: garage.logo_url }}
                          style={styles.cardLogo}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="garage"
                          size={28}
                          color={isClosed ? COLORS.textLight : COLORS.primary}
                        />
                      )}
                      {!isClosed && (
                        <View style={[
                          styles.availDot,
                          { backgroundColor: PIN_COLORS[status] },
                        ]} />
                      )}
                    </View>

                    {/* Info */}
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardName, isClosed && styles.closedText]}>
                        {garage.name}
                      </Text>
                      <View style={styles.ratingRow}>
                        <MaterialCommunityIcons name="star" size={14} color={COLORS.star} />
                        <Text style={styles.ratingText}>
                          {(garage.average_rating || 0).toFixed(1)}
                        </Text>
                        <Text style={styles.reviewCount}>
                          ({garage.total_reviews || 0})
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: (PIN_COLORS[status] || COLORS.textLight) + '15' },
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: PIN_COLORS[status] || COLORS.textLight },
                        ]}>
                          {STATUS_LABELS[status]}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Plan afspraak button */}
                  {!isClosed && (
                    <TouchableOpacity
                      style={styles.planBtn}
                      onPress={() => handleGarageCardPress(garage.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.planBtnText}>Plan afspraak</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptySheet}>
              <MaterialCommunityIcons name="map-search-outline" size={36} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Geen garages in dit gebied</Text>
              <Text style={styles.emptySubtext}>Zoom uit of verschuif de kaart</Text>
            </View>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      </DraggableBottomSheet>
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

  // Map loading
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  // Floating header
  floatingHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  // Date chips
  chipScroll: {
    marginTop: 12,
    flexGrow: 0,
  },
  chipScrollContent: {
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  dateChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dateChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },

  // Map controls
  mapControls: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  mapControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  // Callout
  callout: {
    minWidth: 150,
    padding: 4,
  },
  calloutName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  calloutCity: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  calloutRating: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.star,
  },
  calloutStatus: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Sheet header
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  sheetShowAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },

  // Sheet list
  sheetList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },

  // Garage card
  garageCard: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  garageCardSelected: {
    borderColor: COLORS.secondary + '40',
    borderWidth: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  garageCardClosed: {
    opacity: 0.55,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 14,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  availDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  closedText: {
    color: COLORS.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Plan button
  planBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  planBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Empty
  emptySheet: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
  },
  emptySubtext: {
    color: COLORS.textLight,
    fontSize: 13,
    marginTop: 4,
  },
});
