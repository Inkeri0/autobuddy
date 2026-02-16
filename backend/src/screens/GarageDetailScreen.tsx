import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { useGarageDetail } from '../hooks/useGarages';
import { useAuth } from '../hooks/useAuth';
import { isFavorited, addFavorite, removeFavorite } from '../services/garageService';

const HERO_HEIGHT = 280;

export default function GarageDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { garageId } = route.params;
  const { garage, services, loading, error, refresh } = useGarageDetail(garageId);
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (user && garageId) {
      isFavorited(user.id, garageId).then(setFavorited).catch(() => {});
    }
  }, [user, garageId]);

  const toggleFavorite = async () => {
    if (!user || favLoading) return;
    setFavLoading(true);
    try {
      if (favorited) {
        await removeFavorite(user.id, garageId);
        setFavorited(false);
      } else {
        await addFavorite(user.id, garageId);
        setFavorited(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !garage) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ fontSize: 16, color: COLORS.danger }}>Garage niet gevonden</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={[styles.hero, { height: HERO_HEIGHT }]}>
          {garage.wallpaper_url ? (
            <>
              <Image
                source={{ uri: garage.wallpaper_url }}
                style={styles.heroWallpaper}
              />
              {/* Dark overlay for readability */}
              <View style={styles.heroOverlay} />
            </>
          ) : (
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight, '#7c5caa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradientBg}
            >
              <MaterialCommunityIcons
                name="garage-open-variant"
                size={100}
                color="rgba(255,255,255,0.15)"
              />
            </LinearGradient>
          )}

          {/* Logo badge */}
          {garage.logo_url && (
            <View style={styles.heroLogoBadge}>
              <Image
                source={{ uri: garage.logo_url }}
                style={styles.heroLogo}
              />
            </View>
          )}

          {/* Bottom fade to background */}
          <LinearGradient
            colors={['transparent', COLORS.background]}
            style={styles.heroBottomFade}
          />
        </View>

        {/* Floating Navigation Buttons */}
        <View style={[styles.floatingNav, { top: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={toggleFavorite}
            disabled={favLoading}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={favorited ? 'heart' : 'heart-outline'}
              size={22}
              color="#EF4444"
            />
          </TouchableOpacity>
        </View>

        {/* Content Body — overlaps hero */}
        <View style={styles.body}>
          {/* Garage Name */}
          <Text style={styles.garageName}>{garage.name}</Text>

          {/* Rating Badge */}
          <TouchableOpacity
            style={styles.ratingRow}
            onPress={() =>
              navigation.navigate('GarageReviews', {
                garageId: garage.id,
                garageName: garage.name,
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={14} color={COLORS.star} />
              <Text style={styles.ratingValue}>
                {(garage.average_rating || 0).toFixed(1)}
              </Text>
            </View>
            <Text style={styles.reviewCount}>
              ({garage.total_reviews || 0} beoordelingen)
            </Text>
          </TouchableOpacity>

          {/* Address & Contact Card */}
          <View style={styles.contactCard}>
            <View style={styles.addressRow}>
              <View style={styles.locationIconBox}>
                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressMain}>{garage.address}</Text>
                <Text style={styles.addressSub}>
                  {garage.postal_code} {garage.city}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Map')} activeOpacity={0.7}>
                <Text style={styles.mapLink}>Kaart</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactBtns}>
              {garage.phone && (
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(`tel:${garage.phone}`)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="phone" size={16} color={COLORS.primary} />
                  <Text style={styles.contactBtnLabel}>Bel nu</Text>
                </TouchableOpacity>
              )}
              {garage.email && (
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(`mailto:${garage.email}`)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="email-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.contactBtnLabel}>E-mail</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Specialisaties */}
          {(garage.brands_serviced?.length > 0 || garage.is_ev_specialist) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specialisaties</Text>
              <View style={styles.tagsWrap}>
                {(garage.brands_serviced || []).map((brand: string) => (
                  <View key={brand} style={styles.tag}>
                    <Text style={styles.tagText}>{brand}</Text>
                  </View>
                ))}
                {garage.is_ev_specialist && (
                  <View
                    style={[
                      styles.tag,
                      {
                        backgroundColor: COLORS.success + '12',
                        borderColor: COLORS.success + '20',
                      },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: COLORS.success }]}>
                      EV Specialist
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          {garage.description ? (
            <View style={styles.section}>
              <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22 }}>
                {garage.description}
              </Text>
            </View>
          ) : null}

          {/* Diensten & Prijzen */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Diensten & Prijzen</Text>
              <Text style={styles.allServicesLabel}>ALLE DIENSTEN</Text>
            </View>

            {services.length > 0 ? (
              <View style={{ gap: 10 }}>
                {services.map((service: any) => (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.serviceCard}
                    onPress={() =>
                      navigation.navigate('Booking', {
                        garageId: garage.id,
                        serviceId: service.id,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      {service.description ? (
                        <Text style={styles.serviceDesc} numberOfLines={1}>
                          {service.description}
                        </Text>
                      ) : service.duration_minutes ? (
                        <Text style={styles.serviceDesc}>
                          ca. {service.duration_minutes} min
                        </Text>
                      ) : null}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.servicePrice}>
                        {'\u20AC'} {service.price_from},-
                      </Text>
                      <View style={styles.bookLink}>
                        <Text style={styles.bookLinkText}>Boek</Text>
                        <MaterialCommunityIcons
                          name="arrow-right"
                          size={12}
                          color={COLORS.primary}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text
                style={{
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                  paddingVertical: 20,
                }}
              >
                Nog geen services beschikbaar
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Booking', { garageId: garage.id })}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.white} />
          <Text style={styles.ctaText}>Afspraak maken</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Hero
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  heroGradientBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroWallpaper: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  } as any,
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroLogoBadge: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  heroLogo: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  heroBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  // Floating nav
  floatingNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  // Body
  body: {
    marginTop: -48,
    paddingHorizontal: 20,
  },

  // Title
  garageName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },

  // Rating
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  ratingValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
    lineHeight: 20,
  },
  reviewCount: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // Contact card
  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.primary + '08',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  locationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressMain: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mapLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  contactBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '15',
    gap: 8,
  },
  contactBtnLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  allServicesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1.5,
    marginBottom: 14,
  },

  // Tags
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary + '08',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primary + '15',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Service cards
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '08',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  serviceDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  bookLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + '10',
    ...Platform.select({
      ios: {
        // backdrop blur is automatic on iOS with translucent bg
      },
    }),
  },
  ctaButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },
});
