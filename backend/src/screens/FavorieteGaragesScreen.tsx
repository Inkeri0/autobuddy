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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, AVAILABILITY_COLORS } from '../constants';
import { AvailabilityStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { fetchUserFavorites, removeFavorite } from '../services/garageService';

export default function FavorieteGaragesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
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

  const getAvailabilityInfo = (status: AvailabilityStatus) => {
    switch (status) {
      case 'green':
        return { text: 'Beschikbaar', color: COLORS.success, hasBg: true };
      case 'orange':
        return { text: 'Beperkt', color: COLORS.warning, hasBg: true };
      case 'red':
        return { text: 'Volgeboekt', color: COLORS.textSecondary, hasBg: false };
      default:
        return { text: 'Beschikbaar', color: COLORS.success, hasBg: true };
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

    const avail = getAvailabilityInfo(garage.availability_status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('GarageDetail', { garageId: item.garage_id })
        }
        activeOpacity={0.97}
      >
        <View style={styles.cardRow}>
          {/* Garage logo or fallback icon */}
          <View style={styles.cardImage}>
            {garage.logo_url ? (
              <Image source={{ uri: garage.logo_url }} style={styles.cardLogo} />
            ) : (
              <MaterialCommunityIcons name="garage" size={32} color={COLORS.primary} />
            )}
          </View>

          <View style={styles.cardInfo}>
            {/* Name + heart */}
            <View style={styles.nameRow}>
              <Text style={styles.garageName} numberOfLines={1}>
                {garage.name}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemove(item.garage_id, garage.name)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="heart"
                  size={24}
                  color={COLORS.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={15}
                color={COLORS.textSecondary}
              />
              <Text style={styles.locationText}>{garage.city}</Text>
            </View>

            {/* Rating + availability */}
            <View style={styles.bottomRow}>
              <View style={styles.ratingGroup}>
                <MaterialCommunityIcons
                  name="star"
                  size={16}
                  color={COLORS.star}
                />
                <Text style={styles.ratingNumber}>
                  {(garage.average_rating || 0).toFixed(1)}
                </Text>
                <Text style={styles.reviewCount}>
                  ({garage.total_reviews || 0})
                </Text>
              </View>
              <View
                style={[
                  styles.availBadge,
                  {
                    backgroundColor: avail.hasBg
                      ? avail.color + '12'
                      : COLORS.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.availText,
                    {
                      color: avail.hasBg ? avail.color : COLORS.textSecondary,
                    },
                  ]}
                >
                  {avail.text.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavorite}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 8 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Custom header */}
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={26}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
                <MaterialCommunityIcons
                  name="tune-variant"
                  size={20}
                  color={COLORS.secondary}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.pageTitle}>Favoriete garages</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons
                name="heart-broken"
                size={44}
                color={COLORS.secondary}
              />
            </View>
            <Text style={styles.emptyText}>Geen favorieten gevonden</Text>
            <Text style={styles.emptySubText}>
              Sla garages op om ze hier terug te vinden.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>Zoek een garage</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating "Kaart" button */}
      {favorites.length > 0 && (
        <TouchableOpacity
          style={[styles.floatingMapBtn, { bottom: 24 + insets.bottom }]}
          onPress={() => navigation.navigate('Map')}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="map" size={16} color={COLORS.white} />
          <Text style={styles.floatingMapText}>Kaart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 20,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
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
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardLogo: {
    width: 96,
    height: 96,
    borderRadius: 14,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  garageName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  availBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  availText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
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
    marginBottom: 28,
  },
  ctaButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingHorizontal: 40,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

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
});
