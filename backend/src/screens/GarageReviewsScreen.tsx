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

  const renderReview = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>?</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.anonName}>Anonieme gebruiker</Text>
          <Text style={styles.timeAgo}>{timeAgo(item.created_at)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <StarDisplay rating={item.rating} size={14} />
          <Text style={styles.ratingNumber}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Sub-ratings */}
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

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryRating}>{avgRating.toFixed(1)}</Text>
            <StarDisplay rating={avgRating} size={24} />
            <Text style={styles.summaryCount}>
              {reviews.length} beoordeling{reviews.length !== 1 ? 'en' : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
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
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRating: { fontSize: 40, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  summaryCount: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, color: COLORS.textLight },
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
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  emptySubText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
});
