import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, AVAILABILITY_COLORS } from '../constants';
import { AvailabilityStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { fetchUserFavorites, removeFavorite } from '../services/garageService';
import StarDisplay from '../components/StarDisplay';

export default function FavorieteGaragesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchUserFavorites(user.id);
      setFavorites(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      Alert.alert('Fout', 'Kon favorieten niet laden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemove = (garageId: string, garageName: string) => {
    Alert.alert(
      'Favoriet verwijderen',
      `Weet je zeker dat je ${garageName} wilt verwijderen uit je favorieten?`,
      [
        { text: 'Nee', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await removeFavorite(user.id, garageId);
              setFavorites((prev) =>
                prev.filter((f) => f.garage_id !== garageId)
              );
            } catch (err) {
              console.error('Failed to remove favorite:', err);
              Alert.alert('Fout', 'Kon favoriet niet verwijderen.');
            }
          },
        },
      ]
    );
  };

  const getStatusText = (status: AvailabilityStatus) => {
    switch (status) {
      case 'green':
        return 'Veel plek';
      case 'orange':
        return 'Beperkt';
      case 'red':
        return 'Vol vandaag';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderFavorite = ({ item }: { item: any }) => {
    const garage = item.garages;
    if (!garage) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('GarageDetail', { garageId: item.garage_id })
        }
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.garageName}>{garage.name}</Text>
            <Text style={styles.garageLocation}>
              {garage.city}, {garage.province}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    AVAILABILITY_COLORS[
                      garage.availability_status as AvailabilityStatus
                    ] || COLORS.success,
                },
              ]}
            />
            <Text style={styles.statusLabel}>
              {getStatusText(garage.availability_status)}
            </Text>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <StarDisplay rating={garage.average_rating || 0} size={14} />
          <Text style={[styles.ratingText, { marginLeft: 6 }]}>
            {(garage.average_rating || 0).toFixed(1)} (
            {garage.total_reviews || 0} reviews)
          </Text>
        </View>

        {garage.brands_serviced?.length > 0 && (
          <View style={styles.tagRow}>
            {garage.brands_serviced.slice(0, 4).map((brand: string) => (
              <View key={brand} style={styles.tag}>
                <Text style={styles.tagText}>{brand}</Text>
              </View>
            ))}
            {garage.is_ev_specialist && (
              <View style={[styles.tag, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.tagText, { color: COLORS.success }]}>
                  EV
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item.garage_id, garage.name)}
        >
          <Text style={styles.removeText}>Verwijderen uit favorieten</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavorite}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>Geen favoriete garages</Text>
            <Text style={styles.emptySubText}>
              Voeg garages toe aan je favorieten vanuit de zoekpagina.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Search' })}
            >
              <Text style={styles.ctaText}>Zoek een garage</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
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
  garageName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  garageLocation: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusLabel: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingStars: { fontSize: 14, marginRight: 6 },
  ratingText: { fontSize: 13, color: COLORS.textSecondary },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  tag: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  removeButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
  },
  removeText: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
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
  ctaButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  ctaText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
