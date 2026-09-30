import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAccessibility } from './context/AccessibilityContext';
import { SimplePatientScreen } from './screens/SimplePatientScreen';
import { CaregiverMedicineScreen } from './screens/CaregiverMedicineScreen';
import { EmergencyInfoScreen } from './screens/EmergencyInfoScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { colors, simpleMode, scaleSize } = useAccessibility();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: scaleSize(64)
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: scaleSize(14),
          fontWeight: '700'
        },
        headerStyle: {
          backgroundColor: colors.surface
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: scaleSize(20)
        }
      }}
    >
      {simpleMode ? (
        <Tab.Screen
          name="PatientToday"
          component={SimplePatientScreen}
          options={{
            title: 'My Medicine',
            tabBarIcon: () => <Text style={{ fontSize: scaleSize(20) }}>💊</Text>
          }}
        />
      ) : (
        <Tab.Screen
          name="CaregiverFeed"
          component={CaregiverMedicineScreen}
          options={{
            title: 'Medicine Loop',
            tabBarIcon: () => <Text style={{ fontSize: scaleSize(20) }}>📋</Text>
          }}
        />
      )}

      <Tab.Screen
        name="Emergency"
        component={EmergencyInfoScreen}
        options={{
          title: 'Emergency',
          tabBarIcon: () => <Text style={{ fontSize: scaleSize(20) }}>🚨</Text>
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: () => <Text style={{ fontSize: scaleSize(20) }}>⚙️</Text>
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useAccessibility();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmergencyInfo"
          component={EmergencyInfoScreen}
          options={{ title: 'Emergency Info' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
