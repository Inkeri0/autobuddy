import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SERVICE_LABELS } from '../constants';
import { ServiceCategory } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
  fetchBookingById,
  fetchReviewForBooking,
  createReview,
} from '../services/garageService';
import StarDisplay from '../components/StarDisplay';

function StarSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      <Text style={styles.starLabel}>{label}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)} style={styles.starTouch}>
            <MaterialCommunityIcons
              name={star <= value ? 'star' : 'star-outline'}
              size={28}
              color={star <= value ? COLORS.star : COLORS.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function formatDateNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ReviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [serviceQuality, setServiceQuality] = useState(0);
  const [honesty, setHonesty] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [comment, setComment] = useState('');

  // Overall rating is the average of the 3 sub-ratings (rounded to nearest int for DB)
  const filledCount = [serviceQuality, honesty, speed].filter((v) => v > 0).length;
  const overallRatingExact = filledCount === 3
    ? (serviceQuality + honesty + speed) / 3
    : 0;
  const overallRating = Math.round(overallRatingExact);

  useEffect(() => {
    (async () => {
      try {
        const bookingData = await fetchBookingById(bookingId);
        setBooking(bookingData);

        if (user) {
          const review = await fetchReviewForBooking(user.id, bookingId);
          if (review) {
            setExistingReview(review);
            setServiceQuality(review.service_quality);
            setHonesty(review.honesty);
            setSpeed(review.speed);
            setComment(review.comment || '');
          }
        }
      } catch (err) {
        console.error('Failed to load booking for review:', err);
        Alert.alert('Fout', 'Kon gegevens niet laden.');
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId, user]);

  const handleSubmit = async () => {
    if (!user || !booking) return;

    if (serviceQuality === 0 || honesty === 0 || speed === 0) {
      Alert.alert('Alle categorie\u00EBn verplicht', 'Beoordeel kwaliteit, eerlijkheid en snelheid.');
      return;
    }

    setSubmitting(true);
    try {
      await createReview({
        user_id: user.id,
        garage_id: booking.garage_id,
        booking_id: bookingId,
        rating: overallRating,
        comment: comment.trim() || undefined,
        service_quality: serviceQuality,
        honesty,
        speed,
      });

      Alert.alert(
        'Bedankt!',
        'Je beoordeling is geplaatst.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      if (err.code === '23505') {
        Alert.alert('Al beoordeeld', 'Je hebt deze afspraak al beoordeeld.');
      } else {
        Alert.alert('Fout', err.message || 'Kon beoordeling niet plaatsen.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ fontSize: 16, color: COLORS.danger }}>Afspraak niet gevonden</Text>
      </View>
    );
  }

  const garage = booking.garages;
  const service = booking.garage_services;

  if (existingReview) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Je beoordeling</Text>
          <Text style={styles.garageName}>{garage?.name}</Text>
          <Text style={styles.serviceInfo}>
            {service?.name} — {formatDateNL(booking.date)}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.ratingDisplay}>
            <Text style={styles.ratingBig}>{existingReview.rating.toFixed(1)}</Text>
            <StarDisplay rating={existingReview.rating} size={22} />
          </View>

          <View style={styles.divider} />

          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>Kwaliteit</Text>
            <StarDisplay rating={existingReview.service_quality} size={16} />
          </View>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>Eerlijkheid</Text>
            <StarDisplay rating={existingReview.honesty} size={16} />
          </View>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>Snelheid</Text>
            <StarDisplay rating={existingReview.speed} size={16} />
          </View>

          {existingReview.comment && (
            <>
              <View style={styles.divider} />
              <Text style={styles.commentText}>"{existingReview.comment}"</Text>
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Appointment summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Afspraak samenvatting</Text>
        <Text style={styles.garageName}>{garage?.name}</Text>
        <Text style={styles.serviceInfo}>
          {service?.name}
          {service?.category && ` — ${SERVICE_LABELS[service.category as ServiceCategory] || service.category}`}
        </Text>
        <Text style={styles.dateInfo}>{formatDateNL(booking.date)} om {booking.time_slot}</Text>
        {service?.price_from != null && (
          <Text style={styles.priceInfo}>{'\u20AC'}{service.price_from} – {'\u20AC'}{service.price_to}</Text>
        )}
      </View>

      {/* Garage notes */}
      {booking.garage_notes && (
        <View style={[styles.card, { backgroundColor: COLORS.warning + '10' }]}>
          <Text style={[styles.cardTitle, { color: COLORS.warning }]}>Notities van de garage</Text>
          <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 20 }}>
            {booking.garage_notes}
          </Text>
        </View>
      )}

      {/* Rating form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Beoordeel je ervaring</Text>

        <StarSelector label="Kwaliteit" value={serviceQuality} onChange={setServiceQuality} />
        <StarSelector label="Eerlijkheid" value={honesty} onChange={setHonesty} />
        <StarSelector label="Snelheid" value={speed} onChange={setSpeed} />

        {overallRating > 0 && (
          <View style={styles.overallRow}>
            <Text style={styles.overallLabel}>Totaal</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <StarDisplay rating={overallRatingExact} size={18} />
              <Text style={styles.overallScore}>{overallRatingExact.toFixed(1)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Comment */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Opmerking (optioneel)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Vertel over je ervaring bij deze garage..."
          placeholderTextColor={COLORS.textLight}
          value={comment}
          onChangeText={setComment}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{comment.length}/500</Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="star-check" size={20} color={COLORS.white} />
            <Text style={styles.submitText}>Beoordeling plaatsen</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  garageName: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  serviceInfo: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  dateInfo: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  priceInfo: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginTop: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  // Star selector
  starRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  starLabel: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  stars: { flexDirection: 'row', gap: 2 },
  starTouch: { padding: 2 },
  // Overall calculated rating
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  overallLabel: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  overallScore: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  // Comment
  commentInput: {
    height: 100,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  charCount: { fontSize: 12, color: COLORS.textLight, textAlign: 'right', marginTop: 4 },
  // Submit
  submitButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  // Existing review display
  ratingDisplay: { alignItems: 'center', paddingVertical: 8 },
  ratingBig: { fontSize: 40, fontWeight: '800', color: COLORS.text },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryLabel: { fontSize: 14, color: COLORS.textSecondary },
  commentText: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
