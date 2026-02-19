import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { signOut, uploadAvatar, getAvatarUrl } from '../services/auth';

const QUICK_ACTIONS = [
  { key: 'MijnAfspraken', icon: 'calendar-month', label: 'Mijn afspraken' },
  { key: 'MijnAutos', icon: 'car', label: "Mijn auto's" },
  { key: 'Onderhoudshistorie', icon: 'history', label: 'Onderhouds\u00ADhistorie' },
  { key: 'FavorieteGarages', icon: 'heart-outline', label: 'Favoriete garages' },
];

const SETTINGS_ITEMS = [
  { key: 'notifications', icon: 'bell-outline', label: 'Meldingen' },
  { key: 'settings', icon: 'cog-outline', label: 'Instellingen' },
  { key: 'help', icon: 'help-circle-outline', label: 'Help & Support' },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fullName = user?.user_metadata?.full_name || 'Gebruiker';
  const initials = fullName
    .split(' ')
    .map((w: string) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (user) {
      setAvatarUrl(getAvatarUrl(user));
    }
  }, [user]);

  const pickImage = async (useCamera: boolean) => {
    // Request permission
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Toestemming nodig', 'We hebben toegang tot je camera nodig om een foto te maken.');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Toestemming nodig', 'We hebben toegang tot je fotobibliotheek nodig.');
        return;
      }
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const uri = result.assets[0].uri;
    setUploading(true);

    try {
      const url = await uploadAvatar(user!.id, uri);
      setAvatarUrl(url);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      Alert.alert('Fout', 'Kon profielfoto niet uploaden. Probeer het opnieuw.');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuleren', 'Maak een foto', 'Kies uit bibliotheek'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage(true);
          else if (buttonIndex === 2) pickImage(false);
        }
      );
    } else {
      Alert.alert('Profielfoto', 'Hoe wil je je foto wijzigen?', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Maak een foto', onPress: () => pickImage(true) },
        { text: 'Kies uit bibliotheek', onPress: () => pickImage(false) },
      ]);
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

  const handlePress = (key: string) => {
    if (key === 'notifications' || key === 'settings' || key === 'help') {
      Alert.alert('Binnenkort beschikbaar', 'Deze functie wordt binnenkort toegevoegd.');
    } else if (key === 'MijnAfspraken') {
      navigation.navigate('MainTabs', { screen: 'Afspraken' });
    } else if (key === 'MijnAutos') {
      navigation.navigate('MainTabs', { screen: 'MijnAuto' });
    } else {
      navigation.navigate(key);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40 }}
    >
      {/* Page title */}
      <Text style={styles.pageTitle}>Profiel</Text>

      {/* Avatar + User info */}
      <View style={styles.userSection}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleAvatarPress}
          activeOpacity={0.8}
          disabled={uploading}
        >
          <View style={[styles.avatar, avatarUrl && !uploading && styles.avatarWithImage]}>
            {uploading ? (
              <ActivityIndicator size="large" color={COLORS.white} />
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.editBadge}>
            <MaterialCommunityIcons name="pencil" size={16} color={COLORS.secondary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{fullName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Quick Actions 2x2 Grid */}
      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.quickCard}
            onPress={() => handlePress(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.quickIconCircle}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={24}
                color={COLORS.secondary}
              />
            </View>
            <Text style={styles.quickLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings List */}
      <View style={styles.settingsCard}>
        {SETTINGS_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.settingsItem,
              index === SETTINGS_ITEMS.length - 1 && { borderBottomWidth: 0 },
            ]}
            onPress={() => handlePress(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.settingsIconCircle}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
            <Text style={styles.settingsLabel}>{item.label}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleSignOut}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="logout" size={20} color={COLORS.white} />
        <Text style={styles.logoutText}>Uitloggen</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>
        CarYe v2.4.0 {'\u2022'} Gemaakt met passie
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Page title
  pageTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: 24,
    marginBottom: 24,
  },

  // User section
  userSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarWithImage: {
    backgroundColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.white,
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Quick actions grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  quickCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Settings card
  settingsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    marginHorizontal: 20,
    borderRadius: 999,
    paddingVertical: 16,
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 20,
  },
});
