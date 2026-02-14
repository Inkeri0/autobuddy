import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { fetchGarageReviews } from '../services/garageService';
import StarDisplay from '../components/StarDisplay';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'zojuist';
  if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} dagen geleden`;
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={styles.ratingBarRow}>
      <Text style={styles.ratingBarLabel}>{label}</Text>
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.ratingBarValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

export default function GarageReviewsScreen() {
  const route = useRoute<any>();
  const { garageId, garageName } = route.params;

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGarageReviews(garageId)
      .then(setReviews)
      .catch((err) => {
        console.error('Failed to load reviews:', err);
        Alert.alert('Fout', 'Kon reviews niet laden.');
      })
      .finally(() => setLoading(false));
  }, [garageId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const avgQuality = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.service_quality || 0), 0) / reviews.length
    : 0;
  const avgHonesty = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.honesty || 0), 0) / reviews.length
    : 0;
  const avgSpeed = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.speed || 0), 0) / reviews.length
    : 0;

  const renderReview = ({ item }: { item: any }) => {
    const isAnon = item.is_anonymous !== false;
    const profile = item.profiles;
    const displayName = isAnon ? 'Anonieme gebruiker' : (profile?.full_name || 'Gebruiker');
    const initial = displayName.charAt(0).toUpperCase();

    return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.anonName}>{displayName}</Text>
          <Text style={styles.timeAgo}>{timeAgo(item.created_at)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <StarDisplay rating={item.rating} size={14} />
          <Text style={styles.ratingNumber}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Sub-ratings with mini bars */}
      <View style={styles.subRatings}>
        <View style={styles.subRatingItem}>
          <Text style={styles.subLabel}>Kwaliteit</Text>
          <StarDisplay rating={item.service_quality} size={12} />
        </View>
        <View style={styles.subRatingItem}>
          <Text style={styles.subLabel}>Eerlijkheid</Text>
          <StarDisplay rating={item.honesty} size={12} />
        </View>
        <View style={styles.subRatingItem}>
          <Text style={styles.subLabel}>Snelheid</Text>
          <StarDisplay rating={item.speed} size={12} />
        </View>
      </View>

      {item.comment && (
        <>
          <View style={styles.divider} />
          <Text style={styles.comment}>"{item.comment}"</Text>
        </>
      )}
    </View>
  );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.summaryRatingCol}>
                <Text style={styles.summaryRating}>{avgRating.toFixed(1)}</Text>
                <StarDisplay rating={avgRating} size={22} />
                <Text style={styles.summaryCount}>
                  {reviews.length} beoordeling{reviews.length !== 1 ? 'en' : ''}
                </Text>
              </View>
              <View style={styles.summaryBars}>
                <RatingBar label="Kwaliteit" value={avgQuality} />
                <RatingBar label="Eerlijkheid" value={avgHonesty} />
                <RatingBar label="Snelheid" value={avgSpeed} />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="star-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Nog geen beoordelingen</Text>
            <Text style={styles.emptySubText}>
              Wees de eerste die deze garage beoordeelt!
            </Text>
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
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'flex-start' },
  summaryRatingCol: { alignItems: 'center', marginRight: 20 },
  summaryRating: { fontSize: 40, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  summaryCount: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6 },
  summaryBars: { flex: 1, justifyContent: 'center', gap: 8 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingBarLabel: { fontSize: 11, color: COLORS.textSecondary, width: 70 },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  ratingBarValue: { fontSize: 12, fontWeight: '600', color: COLORS.text, width: 28, textAlign: 'right' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  anonName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  timeAgo: { fontSize: 12, color: COLORS.textLight, marginTop: 1 },
  ratingNumber: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  subRatings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  subRatingItem: { alignItems: 'center' },
  subLabel: { fontSize: 11, color: COLORS.textLight, marginBottom: 4 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  comment: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 10 },
  emptySubText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
});
