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
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import {
  fetchBookingById,
  fetchReviewForBooking,
  createReview,
} from '../services/garageService';
import { formatDateFullMonthNL } from '../utils/dateFormatters';

const STAR_GOLD = '#F59E0B';
const STAR_FADED = '#F59E0B33';

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
              name="star"
              size={26}
              color={star <= value ? STAR_GOLD : STAR_FADED}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StarDisplayRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialCommunityIcons
          key={s}
          name="star"
          size={size}
          color={s <= rating ? STAR_GOLD : STAR_FADED}
        />
      ))}
    </View>
  );
}

export default function ReviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [serviceQuality, setServiceQuality] = useState(0);
  const [honesty, setHonesty] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

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
        is_anonymous: isAnonymous,
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
  const carInfo = [booking.car_brand, booking.car_model].filter(Boolean).join(' ');
  const plateInfo = booking.car_license_plate;

  // Existing review — read-only view
  if (existingReview) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={26} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Beoordeling</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Appointment Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                {garage?.logo_url ? (
                  <Image source={{ uri: garage.logo_url }} style={styles.summaryLogo} />
                ) : (
                  <MaterialCommunityIcons name="garage" size={28} color={COLORS.secondary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.garageName}>{garage?.name}</Text>
                <Text style={styles.serviceDate}>
                  {service?.name} {'\u2022'} {formatDateFullMonthNL(booking.date)}
                </Text>
                {(carInfo || plateInfo) && (
                  <Text style={styles.carInfo}>
                    {carInfo}{carInfo && plateInfo ? ' \u2022 ' : ''}{plateInfo}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Category ratings */}
          <View style={styles.ratingsSection}>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Kwaliteit</Text>
              <StarDisplayRow rating={existingReview.service_quality} size={22} />
            </View>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Eerlijkheid</Text>
              <StarDisplayRow rating={existingReview.honesty} size={22} />
            </View>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Snelheid</Text>
              <StarDisplayRow rating={existingReview.speed} size={22} />
            </View>
          </View>

          {/* Average display */}
          <View style={styles.averageBox}>
            <Text style={styles.averageScore}>{existingReview.rating.toFixed(1)}</Text>
            <Text style={styles.averageLabel}>UW GEMIDDELDE SCORE</Text>
          </View>

          {/* Comment */}
          {existingReview.comment && (
            <View style={styles.commentSection}>
              <Text style={styles.sectionLabel}>Opmerkingen</Text>
              <View style={styles.commentBox}>
                <Text style={styles.commentReadOnly}>{existingReview.comment}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // New review form
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Beoordeling</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Appointment Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              {garage?.logo_url ? (
                <Image source={{ uri: garage.logo_url }} style={styles.summaryLogo} />
              ) : (
                <MaterialCommunityIcons name="garage" size={28} color={COLORS.secondary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.garageName}>{garage?.name}</Text>
              <Text style={styles.serviceDate}>
                {service?.name} {'\u2022'} {formatDateFullMonthNL(booking.date)}
              </Text>
              {(carInfo || plateInfo) && (
                <Text style={styles.carInfo}>
                  {carInfo}{carInfo && plateInfo ? ' \u2022 ' : ''}{plateInfo}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Rating categories */}
        <View style={styles.ratingsSection}>
          <StarSelector label="Kwaliteit" value={serviceQuality} onChange={setServiceQuality} />
          <StarSelector label="Eerlijkheid" value={honesty} onChange={setHonesty} />
          <StarSelector label="Snelheid" value={speed} onChange={setSpeed} />
        </View>

        {/* Average display */}
        <View style={styles.averageBox}>
          <Text style={styles.averageScore}>
            {overallRatingExact > 0 ? overallRatingExact.toFixed(1) : '-'}
          </Text>
          <Text style={styles.averageLabel}>UW GEMIDDELDE SCORE</Text>
        </View>

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionLabel}>Opmerkingen</Text>
          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="Deel uw ervaring met deze garage..."
              placeholderTextColor={COLORS.textLight}
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{comment.length} / 500</Text>
          </View>
        </View>

        {/* Anonymous toggle */}
        <View style={styles.anonymousRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.anonymousLabel}>Anoniem plaatsen</Text>
            <Text style={styles.anonymousHint}>Je naam wordt niet getoond bij de beoordeling</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: COLORS.border, true: COLORS.secondary + '60' }}
            thumbColor={isAnonymous ? COLORS.secondary : COLORS.textLight}
          />
        </View>
      </ScrollView>

      {/* Fixed footer button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.submitText}>Beoordeling plaatsen</Text>
              <MaterialCommunityIcons name="send" size={18} color={COLORS.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Appointment summary card
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.secondary + '15',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  summaryLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  garageName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  serviceDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  carInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 3,
  },

  // Ratings section
  ratingsSection: {
    marginBottom: 32,
    gap: 20,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  stars: { flexDirection: 'row', gap: 3 },
  starTouch: { padding: 2 },

  // Average score box
  averageBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    backgroundColor: STAR_GOLD + '08',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: STAR_GOLD + '30',
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  averageScore: {
    fontSize: 56,
    fontWeight: '900',
    color: STAR_GOLD,
    lineHeight: 62,
  },
  averageLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: STAR_GOLD + 'AA',
    letterSpacing: 2.5,
    marginTop: 6,
  },

  // Comment section
  commentSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    marginLeft: 2,
  },
  commentInputWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  commentInput: {
    minHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  charCount: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  commentBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  commentReadOnly: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },

  // Category row (existing review)
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Anonymous toggle
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  anonymousLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  anonymousHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: COLORS.background,
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },
});
