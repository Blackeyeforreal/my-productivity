// App.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import OnboardingScreen from './screens/OnboardingScreen';
import TodayScreen from './screens/TodayScreen';
import CalendarScreen from './screens/calender/CalendarScreen';
import InsightsScreen from './screens/insights/InsightsScreen';
import SettingsScreen from './screens/settings/SettingScreens';
import AddEditHabitScreen from './screens/habit/AddEditHabitScreen';

// Context
import { HabitProvider } from './context/HabitContext';
import { COLORS } from './constants/colors';
import { RootStackParamList, TabParamList } from './types/navigation';




const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'Today':
              iconName = focused ? 'today' : 'today-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Insights':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'circle-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setShowOnboarding(!hasSeenOnboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <HabitProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {showOnboarding ? (
            <Stack.Screen name="Onboarding">
              {(props) => <OnboardingScreen {...props} onComplete={completeOnboarding} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen 
                name="AddEditHabit" 
                component={AddEditHabitScreen}
                options={{
                  presentation: 'modal',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </HabitProvider>
  );
}
