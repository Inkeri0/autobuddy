import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Marker, Callout, type Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, AVAILABILITY_COLORS, MAASTRICHT_MAP_REGION } from '../constants';
import { AvailabilityStatus } from '../types';
import { useGarages } from '../hooks/useGarages';
import { fetchBookingCountsByDate } from '../services/garageService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.48;

const DAY_NAMES_NL = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Generate next 7 days
function getNext7Days(): { date: string; label: string; dayKey: string; isToday: boolean }[] {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push({
      date: `${yyyy}-${mm}-${dd}`,
      label: `${DAY_NAMES_NL[d.getDay()]} ${d.getDate()}`,
      dayKey: DAY_KEYS[d.getDay()],
      isToday: i === 0,
    });
  }
  return days;
}

// Determine pin color based on bookings + open/closed
function getPinStatus(
  garage: any,
  dayKey: string,
  bookingCount: number,
): 'closed' | AvailabilityStatus {
  // Check if closed on this day
  const hours = garage.opening_hours?.[dayKey];
  if (!hours || hours.closed) return 'closed';

  // Dynamic busyness based on booking count
  if (bookingCount >= 6) return 'red';
  if (bookingCount >= 3) return 'orange';
  return 'green';
}

const PIN_COLORS: Record<string, string> = {
  green: AVAILABILITY_COLORS.green,
  orange: AVAILABILITY_COLORS.orange,
  red: AVAILABILITY_COLORS.red,
  closed: '#1A1A2E', // dark/black for closed
};

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const { garages, loading } = useGarages();
  const [region, setRegion] = useState<Region>(MAASTRICHT_MAP_REGION);
  const mapRef = useRef<any>(null);

  const days = useMemo(() => getNext7Days(), []);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});

  // Fetch booking counts when date changes
  useEffect(() => {
    let cancelled = false;
    fetchBookingCountsByDate(selectedDate.date)
      .then((counts) => { if (!cancelled) setBookingCounts(counts); })
      .catch((err) => {
        console.error('Failed to load booking counts:', err);
        if (!cancelled) setBookingCounts({});
      });
    return () => { cancelled = true; };
  }, [selectedDate.date]);

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

  const handleGaragePress = useCallback((garageId: string) => {
    navigation.navigate('GarageDetail', { garageId });
  }, [navigation]);

  const getGarageStatus = useCallback((garage: any) => {
    return getPinStatus(garage, selectedDate.dayKey, bookingCounts[garage.id] || 0);
  }, [selectedDate.dayKey, bookingCounts]);

  const getStatusLabel = (status: string) => {
    if (status === 'closed') return 'Gesloten';
    if (status === 'red') return 'Vol';
    if (status === 'orange') return 'Beperkt';
    return 'Beschikbaar';
  };

  const renderGarageCard = ({ item: garage }: { item: any }) => {
    const status = getGarageStatus(garage);
    return (
      <TouchableOpacity
        style={[styles.garageCard, status === 'closed' && styles.garageCardClosed]}
        onPress={() => handleGaragePress(garage.id)}
      >
        <View style={[styles.cardDot, { backgroundColor: PIN_COLORS[status] }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardName, status === 'closed' && styles.closedText]}>{garage.name}</Text>
          <Text style={styles.cardCity}>{garage.city}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="star" size={14} color={COLORS.star} />
            <Text style={styles.cardRating}>{(garage.average_rating || 0).toFixed(1)}</Text>
          </View>
          <Text style={[styles.statusLabel, { color: PIN_COLORS[status] }]}>
            {getStatusLabel(status)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Date selector */}
      <View style={styles.dateStrip}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dateChip,
              selectedDate.date === day.date && styles.dateChipActive,
            ]}
            onPress={() => setSelectedDate(day)}
          >
            <Text style={[
              styles.dateChipText,
              selectedDate.date === day.date && styles.dateChipTextActive,
            ]}>
              {day.isToday ? 'Vandaag' : day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map */}
      {loading ? (
        <View style={[styles.mapPlaceholder, { height: MAP_HEIGHT }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Kaart laden...</Text>
        </View>
      ) : (
        <ClusteredMapView
          style={{ height: MAP_HEIGHT }}
          initialRegion={MAASTRICHT_MAP_REGION}
          onRegionChangeComplete={handleRegionChangeComplete}
          clusterColor={COLORS.primary}
          clusterTextColor={COLORS.white}
          radius={40}
          mapRef={(ref: any) => { mapRef.current = ref; }}
          showsUserLocation
          showsMyLocationButton
        >
          {garages.map((garage) => {
            const status = getGarageStatus(garage);
            return (
              <Marker
                key={garage.id}
                identifier={garage.id}
                coordinate={{
                  latitude: garage.latitude,
                  longitude: garage.longitude,
                }}
                pinColor={PIN_COLORS[status]}
              >
                <Callout onPress={() => handleGaragePress(garage.id)}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutName}>{garage.name}</Text>
                    <Text style={styles.calloutCity}>{garage.city}</Text>
                    <View style={styles.calloutRow}>
                      <Text style={styles.calloutRating}>★ {(garage.average_rating || 0).toFixed(1)}</Text>
                      <Text style={[styles.calloutStatus, { color: PIN_COLORS[status] }]}>
                        {getStatusLabel(status)}
                      </Text>
                    </View>
                    {status !== 'closed' && (
                      <Text style={styles.calloutHint}>Tik voor details →</Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </ClusteredMapView>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PIN_COLORS.green }]} />
          <Text style={styles.legendText}>Plek</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PIN_COLORS.orange }]} />
          <Text style={styles.legendText}>Beperkt</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PIN_COLORS.red }]} />
          <Text style={styles.legendText}>Vol</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PIN_COLORS.closed }]} />
          <Text style={styles.legendText}>Dicht</Text>
        </View>
      </View>

      {/* Garage list */}
      <View style={styles.listContainer}>
        <View style={styles.dragHandle} />
        <Text style={styles.listHeader}>
          {visibleGarages.length} garage{visibleGarages.length !== 1 ? 's' : ''} in beeld
        </Text>
        <FlatList
          data={visibleGarages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={renderGarageCard}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <MaterialCommunityIcons name="map-search" size={32} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Geen garages in dit gebied</Text>
              <Text style={styles.emptySubtext}>Zoom uit of verschuif de kaart</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Date selector
  dateStrip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 6,
  },
  dateChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  dateChipActive: {
    backgroundColor: COLORS.primary,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  dateChipTextActive: {
    color: COLORS.white,
    fontWeight: '700' as const,
  },
  // Map
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  // Callout
  callout: {
    minWidth: 150,
    padding: 4,
  },
  calloutName: {
    fontSize: 15,
    fontWeight: '700' as const,
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
    fontWeight: '600' as const,
    color: COLORS.star,
  },
  calloutStatus: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  calloutHint: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
  },
  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500' as const,
  },
  // List
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  listHeader: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  garageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  garageCardClosed: {
    opacity: 0.55,
  },
  cardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  closedText: {
    color: COLORS.textSecondary,
  },
  cardCity: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cardRating: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  emptySubtext: {
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 4,
  },
});
