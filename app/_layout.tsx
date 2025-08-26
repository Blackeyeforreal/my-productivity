import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="HabbiTracker" options={{ title: 'Habits', tabBarIcon: ({ color, size }) => <FontAwesome name="check" color={color} size={size} /> }} />
      <Tabs.Screen name="timer" options={{ title: 'Timer', tabBarIcon: ({ color, size }) => <FontAwesome name="clock-o" color={color} size={size} /> }} />
      <Tabs.Screen name="reminders" options={{ title: 'Reminders', tabBarIcon: ({ color, size }) => <FontAwesome name="bell" color={color} size={size} /> }} />
    </Tabs>
  );
}
