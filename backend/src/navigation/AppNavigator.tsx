import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MapScreen from '../screens/MapScreen';
import GarageDetailScreen from '../screens/GarageDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MijnAfsprakenScreen from '../screens/MijnAfsprakenScreen';
import MijnAutosScreen from '../screens/MijnAutosScreen';
import FavorieteGaragesScreen from '../screens/FavorieteGaragesScreen';
import AfspraakDetailScreen from '../screens/AfspraakDetailScreen';
import ReviewScreen from '../screens/ReviewScreen';
import GarageReviewsScreen from '../screens/GarageReviewsScreen';
import OnderhoudshistorieScreen from '../screens/OnderhoudshistorieScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: 'home',
  Afspraken: 'calendar-month',
  MijnAuto: 'car',
  Profile: 'account',
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const iconName = TAB_ICONS[label] || 'circle';
  return (
    <MaterialCommunityIcons
      name={iconName as any}
      size={focused ? 26 : 22}
      color={focused ? COLORS.primary : COLORS.textLight}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 6,
          paddingTop: 4,
          height: 64,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTitleStyle: {
          fontWeight: '700' as const,
          color: COLORS.text,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false, tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Afspraken"
        component={MijnAfsprakenScreen}
        options={{ headerShown: false, tabBarLabel: 'Afspraken' }}
      />
      <Tab.Screen
        name="MijnAuto"
        component={MijnAutosScreen}
        options={{ headerShown: false, tabBarLabel: 'Mijn Auto' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false, tabBarLabel: 'Profiel' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>AutoBuddy</Text>
        <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { fontWeight: '700' as const, color: COLORS.text },
          headerTintColor: COLORS.primary,
        }}
      >
        {!session ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Map"
              component={MapScreen}
              options={{ title: 'Kaart' }}
            />
            <Stack.Screen
              name="GarageDetail"
              component={GarageDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Booking"
              component={BookingScreen}
              options={{ title: 'Afspraak maken' }}
            />
            <Stack.Screen
              name="MijnAfspraken"
              component={MijnAfsprakenScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MijnAutos"
              component={MijnAutosScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FavorieteGarages"
              component={FavorieteGaragesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AfspraakDetail"
              component={AfspraakDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Review"
              component={ReviewScreen}
              options={{ title: 'Beoordeling' }}
            />
            <Stack.Screen
              name="GarageReviews"
              component={GarageReviewsScreen}
              options={{ title: 'Beoordelingen' }}
            />
            <Stack.Screen
              name="Onderhoudshistorie"
              component={OnderhoudshistorieScreen}
              options={{ title: 'Onderhoudshistorie' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
