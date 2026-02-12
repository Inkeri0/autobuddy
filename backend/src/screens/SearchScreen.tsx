import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SERVICE_LABELS, AVAILABILITY_COLORS } from '../constants';
import { ServiceCategory, AvailabilityStatus } from '../types';
import { fetchGarages, fetchGarageServices } from '../services/garageService';
import StarDisplay from '../components/StarDisplay';

const FILTER_CATEGORIES: { key: ServiceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: 'apk', label: 'APK' },
  { key: 'small_service', label: 'Kleine beurt' },
  { key: 'major_service', label: 'Grote beurt' },
  { key: 'tire_change', label: 'Banden' },
  { key: 'brakes', label: 'Remmen' },
  { key: 'oil_change', label: 'Oliebeurt' },
  { key: 'airco_service', label: 'Airco' },
  { key: 'diagnostics', label: 'Diagnose' },
];

const BOTTOM_TABS = [
  { key: 'Home', icon: 'home', label: 'Home' },
  { key: 'Afspraken', icon: 'calendar-month', label: 'Afspraken' },
  { key: 'Map', icon: 'map', label: 'Kaart' },
  { key: 'Profile', icon: 'account', label: 'Profiel' },
];

export default function SearchScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const initialCategory = route.params?.serviceCategory;

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(initialCategory);
  const [searchText, setSearchText] = useState('');
  const [locationText, setLocationText] = useState('');
  const [garages, setGarages] = useState<any[]>([]);
  const [garageServices, setGarageServices] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route.params?.serviceCategory) {
      setSelectedCategory(route.params.serviceCategory);
    }
  }, [route.params?.serviceCategory]);

  useEffect(() => {
    loadGarages();
  }, []);

  const loadGarages = async () => {
    setLoading(true);
    try {
      const data = await fetchGarages();
      setGarages(data);
      const servicesMap: Record<string, any[]> = {};
      await Promise.all(
        data.map(async (g: any) => {
          try {
            const services = await fetchGarageServices(g.id);
            servicesMap[g.id] = services;
          } catch (err) {
            console.error(`Failed to load services for garage ${g.id}:`, err);
          }
        })
      );
      setGarageServices(servicesMap);
    } catch (err) {
      console.error('Failed to load garages:', err);
      Alert.alert('Fout', 'Kon garages niet laden.');
    } finally {
      setLoading(false);
    }
  };

  const filteredGarages = garages.filter((garage) => {
    if (searchText) {
      const q = searchText.toLowerCase();
      if (
        !garage.name.toLowerCase().includes(q) &&
        !garage.brands_serviced?.some((b: string) => b.toLowerCase().includes(q))
      ) return false;
    }
    if (locationText) {
      const l = locationText.toLowerCase();
      if (
        !garage.city?.toLowerCase().includes(l) &&
        !garage.postal_code?.toLowerCase().includes(l)
      ) return false;
    }
    if (selectedCategory) {
      const services = garageServices[garage.id] || [];
      if (!services.some((s: any) => s.category === selectedCategory)) return false;
    }
    return true;
  });

  const getAvailabilityInfo = (status: AvailabilityStatus) => {
    switch (status) {
      case 'green':
        return { text: 'Beschikbaar', color: COLORS.success, hasDot: true };
      case 'orange':
        return { text: 'Beperkt', color: COLORS.warning, hasDot: true };
      case 'red':
        return { text: 'Morgen vol', color: COLORS.textSecondary, hasDot: false };
      default:
        return { text: 'Beschikbaar', color: COLORS.success, hasDot: true };
    }
  };

  const handleTabPress = (key: string) => {
    if (key === 'Map') {
      navigation.navigate('Map');
    } else {
      navigation.navigate('MainTabs', { screen: key });
    }
  };

  const renderGarage = ({ item }: { item: any }) => {
    const availability = getAvailabilityInfo(item.availability_status);
    const matchingService = selectedCategory
      ? (garageServices[item.id] || []).find((s: any) => s.category === selectedCategory)
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GarageDetail', { garageId: item.id })}
        activeOpacity={0.97}
      >
        <View style={styles.cardRow}>
          {/* Image placeholder */}
          <View style={styles.cardImage}>
            <MaterialCommunityIcons name="garage" size={32} color={COLORS.primary} />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <View
                style={[
                  styles.availBadge,
                  {
                    backgroundColor: availability.hasDot
                      ? availability.color + '12'
                      : COLORS.background,
                  },
                ]}
              >
                {availability.hasDot && (
                  <View
                    style={[styles.availDot, { backgroundColor: availability.color }]}
                  />
                )}
                <Text
                  style={[
                    styles.availText,
                    {
                      color: availability.hasDot
                        ? availability.color
                        : COLORS.textSecondary,
                    },
                  ]}
                >
                  {availability.text}
                </Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.textSecondary} />
              <Text style={styles.locationText}>
                {item.city}, {item.province}
              </Text>
            </View>

            <View style={styles.ratingRow}>
              <StarDisplay rating={item.average_rating || 0} size={14} />
              <Text style={styles.ratingNumber}>
                {(item.average_rating || 0).toFixed(1)}
              </Text>
              <Text style={styles.reviewCount}>
                ({item.total_reviews || 0} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Brand tags */}
        {item.brands_serviced?.length > 0 && (
          <View style={styles.tagSection}>
            {item.brands_serviced.slice(0, 4).map((brand: string) => (
              <View key={brand} style={styles.tag}>
                <Text style={styles.tagText}>{brand.toUpperCase()}</Text>
              </View>
            ))}
            {item.is_ev_specialist && (
              <View style={[styles.tag, { backgroundColor: COLORS.success + '12' }]}>
                <Text style={[styles.tagText, { color: COLORS.success }]}>EV</Text>
              </View>
            )}
          </View>
        )}

        {matchingService && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {SERVICE_LABELS[matchingService.category as ServiceCategory]}
            </Text>
            <Text style={styles.priceValue}>
              {'\u20AC'}{matchingService.price_from} – {'\u20AC'}{matchingService.price_to}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sticky header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Zoeken</Text>

        <View style={styles.inputGroup}>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={COLORS.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Service of trefwoord"
              placeholderTextColor={COLORS.textLight}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={COLORS.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Stad of postcode"
              placeholderTextColor={COLORS.textLight}
              value={locationText}
              onChangeText={setLocationText}
            />
          </View>
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipList}
        contentContainerStyle={styles.chipListContent}
      >
        {FILTER_CATEGORIES.map((cat) => {
          const isActive =
            cat.key === 'all' ? !selectedCategory : selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() =>
                setSelectedCategory(
                  cat.key === 'all' ? undefined : (cat.key as ServiceCategory)
                )
              }
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Garages laden...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGarages}
          keyExtractor={(item) => item.id}
          renderItem={renderGarage}
          contentContainerStyle={styles.resultList}
          ListHeaderComponent={
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                GARAGES IN DE BUURT ({filteredGarages.length})
              </Text>
              <TouchableOpacity style={styles.filterBtn}>
                <MaterialCommunityIcons
                  name="tune-variant"
                  size={18}
                  color={COLORS.secondary}
                />
                <Text style={styles.filterBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="magnify-close"
                size={44}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyText}>Geen garages gevonden</Text>
              <Text style={styles.emptySubText}>
                Pas je zoekopdracht of filters aan.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating "Toon Kaart" button */}
      <TouchableOpacity
        style={[styles.floatingMapBtn, { bottom: 76 + (insets.bottom || 6) }]}
        onPress={() => navigation.navigate('Map')}
        activeOpacity={0.9}
      >
        <MaterialCommunityIcons name="map" size={18} color={COLORS.white} />
        <Text style={styles.floatingMapText}>Toon Kaart</Text>
      </TouchableOpacity>

      {/* Custom bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom || 6 }]}>
        {BOTTOM_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.bottomTab}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={22}
              color={COLORS.textLight}
            />
            <Text style={styles.bottomTabLabel}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 18,
  },
  inputGroup: {
    gap: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },

  // Category chips
  chipList: {
    height: 56,
    flexGrow: 0,
    flexShrink: 0,
  },
  chipListContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.white,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Results
  resultList: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 1.5,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  // Garage card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 14,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availText: {
    fontSize: 11,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 3,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // Tags
  tagSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tag: {
    backgroundColor: COLORS.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },

  // Price row
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Floating map button
  floatingMapBtn: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingMapText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Bottom navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  bottomTab: {
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  bottomTabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 3,
  },
});
