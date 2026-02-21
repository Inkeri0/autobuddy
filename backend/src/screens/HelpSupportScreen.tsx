import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

// ─── FAQ Data ───────────────────────────────────────
const FAQ_ITEMS = [
  {
    question: 'Hoe boek ik een afspraak bij een garage?',
    answer:
      'Zoek een garage via de zoekpagina of de kaart. Tik op de garage, kies een dienst en selecteer een datum en tijd. Bevestig je boeking en je ontvangt een bevestiging.',
  },
  {
    question: 'Kan ik een afspraak annuleren?',
    answer:
      'Ja, ga naar "Mijn afspraken", tik op de afspraak die je wilt annuleren en kies "Afspraak annuleren". Dit kan tot 24 uur voor de afspraak kosteloos.',
  },
  {
    question: 'Hoe voeg ik een auto toe?',
    answer:
      'Ga naar "Mijn auto\'s" in je profiel. Tik op "Auto toevoegen" en voer je kenteken in. We halen automatisch je voertuiggegevens op via de RDW.',
  },
  {
    question: 'Hoe werkt het reviewsysteem?',
    answer:
      'Na een afgeronde afspraak kun je een beoordeling achterlaten. Geef sterren (1-5) en schrijf je ervaring. Reviews helpen andere gebruikers de beste garage te vinden.',
  },
  {
    question: 'Mijn kenteken wordt niet herkend, wat nu?',
    answer:
      'Controleer of je het kenteken juist hebt ingevoerd (zonder streepjes). Als het probleem aanhoudt, kun je de gegevens handmatig invoeren of contact met ons opnemen.',
  },
  {
    question: 'Hoe wijzig ik mijn profielfoto?',
    answer:
      'Ga naar je profiel en tik op je profielfoto. Je kunt een nieuwe foto maken met je camera of een bestaande foto uit je bibliotheek kiezen.',
  },
  {
    question: 'Is mijn data veilig?',
    answer:
      'Ja, we gebruiken versleutelde verbindingen en slaan je gegevens veilig op. We delen je persoonlijke informatie nooit met derden zonder je toestemming.',
  },
];

// ─── Contact Options ────────────────────────────────
const CONTACT_OPTIONS = [
  {
    icon: 'email-outline',
    label: 'E-mail ons',
    detail: 'support@carye.nl',
    action: () => Linking.openURL('mailto:support@carye.nl'),
  },
  {
    icon: 'phone-outline',
    label: 'Bel ons',
    detail: 'Ma-Vr, 09:00 - 17:00',
    action: () => Linking.openURL('tel:+31201234567'),
  },
  {
    icon: 'whatsapp',
    label: 'WhatsApp',
    detail: 'Chat direct met ons',
    action: () => Linking.openURL('https://wa.me/31201234567'),
  },
];

// ─── How It Works Steps ─────────────────────────────
const HOW_IT_WORKS = [
  { icon: 'magnify', title: 'Zoek', desc: 'Vind een garage in de buurt via de kaart of zoekbalk' },
  { icon: 'calendar-check', title: 'Boek', desc: 'Kies een dienst, datum en tijdstip dat jou past' },
  { icon: 'car-wrench', title: 'Rijd', desc: 'Breng je auto naar de garage op het afgesproken moment' },
  { icon: 'star', title: 'Beoordeel', desc: 'Deel je ervaring en help andere autorijders' },
];

// ─── FAQ Item Component ─────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen(!open)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={COLORS.textLight}
        />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

// ─── Main Screen ────────────────────────────────────
export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* How It Works */}
        <Text style={styles.sectionTitle}>Hoe werkt CarYe?</Text>
        <View style={styles.stepsRow}>
          {HOW_IT_WORKS.map((step, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
              </View>
              <View style={styles.stepIconCircle}>
                <MaterialCommunityIcons name={step.icon as any} size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Veelgestelde vragen</Text>
        <View style={styles.faqCard}>
          {FAQ_ITEMS.map((item, i) => (
            <React.Fragment key={i}>
              <FaqItem question={item.question} answer={item.answer} />
              {i < FAQ_ITEMS.length - 1 && <View style={styles.faqDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>Neem contact op</Text>
        <View style={styles.contactCard}>
          {CONTACT_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.contactItem,
                i === CONTACT_OPTIONS.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={opt.action}
              activeOpacity={0.7}
            >
              <View style={styles.contactIconCircle}>
                <MaterialCommunityIcons name={opt.icon as any} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>{opt.label}</Text>
                <Text style={styles.contactDetail}>{opt.detail}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* About Section */}
        <View style={styles.aboutCard}>
          <MaterialCommunityIcons name="car-wrench" size={32} color={COLORS.primary} />
          <Text style={styles.aboutTitle}>CarYe</Text>
          <Text style={styles.aboutVersion}>Versie 0.1.0</Text>
          <Text style={styles.aboutDesc}>
            CarYe verbindt autorijders met betrouwbare garages in heel Nederland.
            Eenvoudig zoeken, boeken en je onderhoudshistorie bijhouden — alles in één app.
          </Text>
          <View style={styles.aboutLinks}>
            <TouchableOpacity style={styles.aboutLink}>
              <Text style={styles.aboutLinkText}>Privacybeleid</Text>
            </TouchableOpacity>
            <View style={styles.aboutLinkDot} />
            <TouchableOpacity style={styles.aboutLink}>
              <Text style={styles.aboutLinkText}>Gebruiksvoorwaarden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Section title
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
    marginTop: 8,
  },

  // How it works
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  stepItem: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  stepCircle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  stepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },

  // FAQ
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 28,
  },
  faqItem: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 10,
    paddingRight: 8,
  },
  faqDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },

  // Contact
  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 28,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  contactDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // About
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 8,
  },
  aboutVersion: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
    marginBottom: 12,
  },
  aboutDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  aboutLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aboutLink: {},
  aboutLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  aboutLinkDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textLight,
  },
});