import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SERVICE_LABELS, AVAILABILITY_COLORS } from '../constants';
import { ServiceCategory, AvailabilityStatus } from '../types';
import { fetchGarages, fetchGarageServices } from '../services/garageService';
import StarDisplay from '../components/StarDisplay';

const ALL_CATEGORIES: ServiceCategory[] = [
  'apk', 'oil_change', 'small_service', 'major_service',
  'tire_change', 'brakes', 'airco_service', 'diagnostics',
  'bodywork', 'electrical', 'exhaust', 'suspension', 'other',
];

export default function SearchScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const initialCategory = route.params?.serviceCategory;

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(initialCategory);
  const [searchText, setSearchText] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [garages, setGarages] = useState<any[]>([]);
  const [garageServices, setGarageServices] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // Sync category when navigating from HomeScreen with params
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
      Alert.alert('Fout', 'Kon garages niet laden. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const filteredGarages = garages.filter((garage) => {
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!garage.name.toLowerCase().includes(q) && !garage.city.toLowerCase().includes(q)) return false;
    }
    if (brandFilter) {
      const b = brandFilter.toLowerCase();
      if (!garage.brands_serviced?.some((brand: string) => brand.toLowerCase().includes(b))) return false;
    }
    if (selectedCategory) {
      const services = garageServices[garage.id] || [];
      if (!services.some((s: any) => s.category === selectedCategory)) return false;
    }
    return true;
  });

  const getStatusText = (status: AvailabilityStatus) => {
    switch (status) {
      case 'green': return 'Veel plek';
      case 'orange': return 'Beperkt';
      case 'red': return 'Vol vandaag';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Garages laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Zoek garage of stad..." placeholderTextColor={COLORS.textLight} value={searchText} onChangeText={setSearchText} />
        <TextInput style={[styles.searchInput, { marginBottom: 0 }]} placeholder="Filter op merk (bijv. BMW)" placeholderTextColor={COLORS.textLight} value={brandFilter} onChangeText={setBrandFilter} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContainer}>
        <TouchableOpacity style={[styles.chip, !selectedCategory && styles.chipActive]} onPress={() => setSelectedCategory(undefined)}>
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Alles</Text>
        </TouchableOpacity>
        {ALL_CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat} style={[styles.chip, selectedCategory === cat && styles.chipActive]} onPress={() => setSelectedCategory(selectedCategory === cat ? undefined : cat)}>
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{SERVICE_LABELS[cat]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
        <Text style={styles.resultCount}>{filteredGarages.length} garage{filteredGarages.length !== 1 ? 's' : ''} gevonden</Text>

        {filteredGarages.map((garage) => {
          const services = garageServices[garage.id] || [];
          const matchingService = selectedCategory ? services.find((s: any) => s.category === selectedCategory) : null;

          return (
            <TouchableOpacity key={garage.id} style={styles.garageCard} onPress={() => navigation.navigate('GarageDetail', { garageId: garage.id })}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.garageName}>{garage.name}</Text>
                  <Text style={styles.garageLocation}>📍 {garage.city}, {garage.province}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: AVAILABILITY_COLORS[garage.availability_status as AvailabilityStatus] || COLORS.success }]} />
                  <Text style={styles.statusLabel}>{getStatusText(garage.availability_status)}</Text>
                </View>
              </View>

              <View style={styles.ratingRow}>
                <StarDisplay rating={garage.average_rating || 0} size={14} />
                <Text style={[styles.ratingText, { marginLeft: 6 }]}>{(garage.average_rating || 0).toFixed(1)} ({garage.total_reviews || 0} reviews)</Text>
              </View>

              {garage.brands_serviced?.length > 0 && (
                <View style={styles.tagRow}>
                  {garage.brands_serviced.slice(0, 4).map((brand: string) => (
                    <View key={brand} style={styles.tag}><Text style={styles.tagText}>{brand}</Text></View>
                  ))}
                  {garage.is_ev_specialist && (
                    <View style={[styles.tag, { backgroundColor: '#ECFDF5' }]}><Text style={[styles.tagText, { color: COLORS.success }]}>⚡ EV</Text></View>
                  )}
                </View>
              )}

              {matchingService && (
                <View style={styles.priceRow}>
                  <Text style={styles.serviceName}>{SERVICE_LABELS[matchingService.category as ServiceCategory]}</Text>
                  <Text style={styles.price}>€{matchingService.price_from} – €{matchingService.price_to}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredGarages.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 15, color: COLORS.textSecondary }}>Geen garages gevonden met deze filters.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { padding: 16, paddingBottom: 8, backgroundColor: COLORS.surface },
  searchInput: { height: 44, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.background, marginBottom: 8 },
  chipScroll: { maxHeight: 52, backgroundColor: COLORS.surface },
  chipContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  results: { flex: 1 },
  resultsContent: { padding: 16, paddingBottom: 40 },
  resultCount: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  garageCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  garageName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  garageLocation: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusLabel: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingStars: { fontSize: 14, marginRight: 6 },
  ratingText: { fontSize: 13, color: COLORS.textSecondary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 },
  tag: { backgroundColor: COLORS.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  serviceName: { fontSize: 14, color: COLORS.textSecondary },
  price: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
});
