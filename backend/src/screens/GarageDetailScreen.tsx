import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, AVAILABILITY_COLORS } from '../constants';
import { AvailabilityStatus } from '../types';
import { useGarageDetail } from '../hooks/useGarages';
import { useAuth } from '../hooks/useAuth';
import { isFavorited, addFavorite, removeFavorite } from '../services/garageService';
import StarDisplay from '../components/StarDisplay';

export default function GarageDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { garageId } = route.params;
  const { garage, services, loading, error, refresh } = useGarageDetail(garageId);
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Refetch garage data when screen regains focus (e.g. after placing a review)
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !garage) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: COLORS.danger }}>Garage niet gevonden</Text>
      </View>
    );
  }

  const statusLabel: Record<string, string> = {
    green: 'Veel plek',
    orange: 'Beperkt beschikbaar',
    red: 'Vol vandaag',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.name, { flex: 1 }]}>{garage.name}</Text>
          <TouchableOpacity onPress={toggleFavorite} disabled={favLoading} style={{ padding: 4 }}>
            <Text style={{ fontSize: 24 }}>{favorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View style={[styles.dot, { backgroundColor: AVAILABILITY_COLORS[garage.availability_status as AvailabilityStatus] || COLORS.success }]} />
          <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.textSecondary }}>{statusLabel[garage.availability_status] || 'Beschikbaar'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Adres</Text>
          <Text style={styles.infoValue}>{garage.address}, {garage.city}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📞 Telefoon</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${garage.phone}`)}>
            <Text style={[styles.infoValue, { color: COLORS.secondary }]}>{garage.phone}</Text>
          </TouchableOpacity>
        </View>
        {garage.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✉️ E-mail</Text>
            <Text style={styles.infoValue}>{garage.email}</Text>
          </View>
        )}
      </View>

      {garage.description ? (
        <View style={[styles.card, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 20 }}>{garage.description}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.card, { alignItems: 'center', marginBottom: 24 }]}
        onPress={() => navigation.navigate('GarageReviews', { garageId: garage.id, garageName: garage.name })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: COLORS.text, marginRight: 10 }}>{(garage.average_rating || 0).toFixed(1)}</Text>
          <StarDisplay rating={garage.average_rating || 0} size={20} />
        </View>
        <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>{garage.total_reviews || 0} reviews</Text>
        <Text style={{ fontSize: 12, color: COLORS.secondary, marginTop: 6, fontWeight: '600' }}>Bekijk alle beoordelingen →</Text>
      </TouchableOpacity>

      {(garage.brands_serviced?.length > 0 || garage.specializations?.length > 0) && (
        <>
          <Text style={styles.sectionTitle}>Specialisaties</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {(garage.brands_serviced || []).map((brand: string) => (
              <View key={brand} style={styles.tag}><Text style={styles.tagText}>{brand}</Text></View>
            ))}
            {(garage.specializations || []).map((spec: string) => (
              <View key={spec} style={[styles.tag, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Text style={[styles.tagText, { color: COLORS.primary }]}>{spec}</Text>
              </View>
            ))}
            {garage.is_ev_specialist && (
              <View style={[styles.tag, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={[styles.tagText, { color: COLORS.success }]}>⚡ EV Specialist</Text>
              </View>
            )}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Services & Prijzen</Text>
      {services.length > 0 ? services.map((service: any) => (
        <TouchableOpacity key={service.id} style={styles.serviceCard} onPress={() => navigation.navigate('Booking', { garageId: garage.id, serviceId: service.id })}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>{service.name}</Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>⏱ ca. {service.duration_minutes} min</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.primary }}>€{service.price_from} – €{service.price_to}</Text>
            <Text style={{ fontSize: 12, color: COLORS.secondary, fontWeight: '600', marginTop: 2 }}>Boek →</Text>
          </View>
        </TouchableOpacity>
      )) : (
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 20 }}>Nog geen services beschikbaar</Text>
      )}

      <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Booking', { garageId: garage.id })}>
        <Text style={{ color: COLORS.white, fontSize: 17, fontWeight: '700' }}>Afspraak maken</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  name: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '500', color: COLORS.text, textAlign: 'right', flex: 1, marginLeft: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  tag: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  tagText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 10, padding: 14, marginBottom: 8 },
  ctaButton: { backgroundColor: COLORS.secondary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
});
