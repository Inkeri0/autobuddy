import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../services/auth';
import { seedCompletedBooking } from '../services/garageService';

export default function ProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const handleSeedBooking = async () => {
    if (!user?.id) return;
    try {
      const booking = await seedCompletedBooking(user.id);
      Alert.alert(
        'Test afspraak aangemaakt',
        `Afgeronde afspraak op ${booking.date} om ${booking.time_slot}.\n\nGa naar Mijn afspraken > Afgerond om het te zien.`,
      );
    } catch (err: any) {
      Alert.alert('Fout', err.message || 'Kon test data niet aanmaken.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Fout', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.user_metadata?.full_name || 'Gebruiker'}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Menu items */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MijnAfspraken')}>
          <Text style={styles.menuIcon}>📅</Text>
          <Text style={styles.menuText}>Mijn afspraken</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MijnAutos')}>
          <Text style={styles.menuIcon}>🚗</Text>
          <Text style={styles.menuText}>Mijn auto's</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FavorieteGarages')}>
          <Text style={styles.menuIcon}>⭐</Text>
          <Text style={styles.menuText}>Favoriete garages</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Binnenkort beschikbaar', 'Deze functie wordt binnenkort toegevoegd.')}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Meldingen</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Binnenkort beschikbaar', 'Deze functie wordt binnenkort toegevoegd.')}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Instellingen</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Binnenkort beschikbaar', 'Deze functie wordt binnenkort toegevoegd.')}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>Help & Support</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Uitloggen</Text>
      </TouchableOpacity>

      {/* Dev tools */}
      <TouchableOpacity style={styles.seedButton} onPress={handleSeedBooking}>
        <Text style={styles.seedText}>+ Test afspraak (afgerond)</Text>
      </TouchableOpacity>

      <Text style={styles.version}>AutoBuddy v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  menu: {
    backgroundColor: COLORS.surface,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  menuArrow: {
    fontSize: 22,
    color: COLORS.textLight,
  },
  signOutButton: {
    margin: 20,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    alignItems: 'center',
  },
  signOutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  seedButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  seedText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
  },
});
