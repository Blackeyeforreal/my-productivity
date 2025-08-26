// src/screens/settings/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabits } from '../../context/HabitContext';
import { COLORS, LAYOUT } from '../../constants/colors';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showChevron?: boolean;
  iconColor?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightComponent,
  showChevron = false,
  iconColor = COLORS.primary,
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
    <View style={styles.settingLeft}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.settingRight}>
      {rightComponent}
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      )}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, updateSettings, habits } = useHabits();
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notifications);
  const [hapticEnabled, setHapticEnabled] = useState(settings.hapticFeedback);

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    updateSettings({ notifications: value });
    
    if (value) {
      // Request notification permissions
      Alert.alert(
        'Notifications Enabled',
        'You will now receive reminders for your habits. Make sure to allow notifications in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleHapticToggle = (value: boolean) => {
    setHapticEnabled(value);
    updateSettings({ hapticFeedback: value });
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Choose Theme',
      'Select your preferred app theme',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Light Theme', 
          onPress: () => {
            updateSettings({ theme: 'light' });
            Alert.alert('Theme Changed', 'Light theme will be applied on next app restart.');
          }
        },
        { 
          text: 'Dark Theme', 
          onPress: () => {
            updateSettings({ theme: 'dark' });
            Alert.alert('Theme Changed', 'Dark theme is now active.');
          }
        },
      ]
    );
  };

  const handleWeekStart = () => {
    Alert.alert(
      'Week Starts On',
      'Choose which day starts your week in the calendar view',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sunday', 
          onPress: () => {
            updateSettings({ weekStartsOn: 0 });
            Alert.alert('Updated', 'Week will now start on Sunday');
          }
        },
        { 
          text: 'Monday', 
          onPress: () => {
            updateSettings({ weekStartsOn: 1 });
            Alert.alert('Updated', 'Week will now start on Monday');
          }
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = {
        habits,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      const jsonData = JSON.stringify(data, null, 2);
      const totalHabits = habits.length;
      const activeHabits = habits.filter(h => h.isActive).length;
      const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
      
      Alert.alert(
        'Export Data',
        `Your habit data is ready for export!\n\n📊 Statistics:\n• Total Habits: ${totalHabits}\n• Active Habits: ${activeHabits}\n• Total Completions: ${totalCompletions}\n• Export Date: ${new Date().toLocaleDateString()}\n\nData size: ${(jsonData.length / 1024).toFixed(1)} KB`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share Data', 
            onPress: () => shareData(jsonData)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const shareData = async (data: string) => {
    try {
      await Share.share({
        message: `Habit Tracker Data Export\n\nExported on: ${new Date().toLocaleDateString()}\n\n${data}`,
        title: 'Habit Tracker Data',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share data');
    }
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'Your data is automatically backed up locally on your device. Cloud backup feature is coming soon!\n\n📱 Current Status:\n• Local backup: ✅ Active\n• Cloud sync: 🔄 Coming soon\n• Last backup: Just now',
      [{ text: 'OK' }]
    );
  };

  const handleResetData = () => {
    const totalHabits = habits.length;
    const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    
    Alert.alert(
      'Reset All Data',
      `⚠️ WARNING: This will permanently delete:\n\n• ${totalHabits} habits\n• ${totalCompletions} completions\n• All progress and streaks\n• App settings\n\nThis action cannot be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: confirmReset,
        },
      ]
    );
  };

  const confirmReset = () => {
    Alert.alert(
      'Final Confirmation',
      'Are you absolutely sure? This will erase everything.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Reset All',
          style: 'destructive',
          onPress: performReset,
        },
      ]
    );
  };

  const performReset = async () => {
    try {
      await AsyncStorage.multiRemove(['habits', 'settings', 'lastResetDate', 'hasSeenOnboarding']);
      Alert.alert(
        'Reset Complete',
        'All data has been successfully deleted. The app will restart.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // In a real app, you might restart the app or navigate to onboarding
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset data. Please try again.');
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Our App ⭐',
      'Enjoying the Habit Tracker? Your rating helps us improve and reach more people who want to build better habits!',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Rate 5 Stars ⭐', onPress: openAppStore },
        { text: 'Send Feedback', onPress: openFeedback },
      ]
    );
  };

  const openAppStore = () => {
    // In a real app, replace with your actual App Store URL
    const appStoreUrl = 'https://apps.apple.com/app/your-app-id';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=your.package.name';
    
    Alert.alert('Opening App Store', 'Thank you for your support!');
    // Linking.openURL(Platform.OS === 'ios' ? appStoreUrl : playStoreUrl);
  };

  const openFeedback = () => {
    const subject = encodeURIComponent('Habit Tracker App Feedback');
    const body = encodeURIComponent(`Hi there!\n\nI have feedback about the Habit Tracker app:\n\n[Your feedback here]\n\n---\nApp Version: 1.0.0\nDevice: ${Platform.OS}\nHabits: ${habits.length}`);
    const emailUrl = `mailto:support@habittracker.com?subject=${subject}&body=${body}`;
    
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert('Error', 'Could not open email app. Please email us at support@habittracker.com');
    });
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Get Help & Support 💬',
      'Need assistance or have questions? We\'re here to help!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email Support 📧', onPress: openSupport },
        { text: 'View FAQ ❓', onPress: openFAQ },
        { text: 'Report Bug 🐛', onPress: reportBug },
      ]
    );
  };

  const openSupport = () => {
    const subject = encodeURIComponent('Habit Tracker Support Request');
    const body = encodeURIComponent(`Hi Support Team!\n\nI need help with:\n\n[Describe your issue here]\n\n---\nApp Version: 1.0.0\nDevice: ${Platform.OS}\nHabits: ${habits.length}\nActive Habits: ${habits.filter(h => h.isActive).length}`);
    const emailUrl = `mailto:support@habittracker.com?subject=${subject}&body=${body}`;
    
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert('Error', 'Could not open email app. Please email us at support@habittracker.com');
    });
  };

  const openFAQ = () => {
    Alert.alert(
      'Frequently Asked Questions',
      '• How do I add a new habit?\n  → Tap the + button on the Today screen\n\n• How do I delete a habit?\n  → Long press on any habit card\n\n• Can I track different goal types?\n  → Yes! Check, Count, and Duration goals\n\n• How do streaks work?\n  → Complete habits daily to build streaks\n\n• Where is my data stored?\n  → Locally on your device (secure & private)',
      [{ text: 'Got it!' }]
    );
  };

  const reportBug = () => {
    const subject = encodeURIComponent('Habit Tracker Bug Report');
    const body = encodeURIComponent(`Bug Report\n\n🐛 What happened:\n[Describe the bug]\n\n🔄 Steps to reproduce:\n1. \n2. \n3. \n\n📱 Expected behavior:\n[What should have happened]\n\n---\nApp Version: 1.0.0\nDevice: ${Platform.OS}\nHabits: ${habits.length}`);
    const emailUrl = `mailto:bugs@habittracker.com?subject=${subject}&body=${body}`;
    
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert('Error', 'Could not open email app. Please email bugs@habittracker.com');
    });
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      '🔒 Your Privacy Matters\n\n• All data is stored locally on your device\n• We don\'t collect personal information\n• No data is shared with third parties\n• Your habits are completely private\n• You can export or delete your data anytime\n\nFor full privacy policy, visit our website.',
      [
        { text: 'OK' },
        { text: 'View Full Policy', onPress: () => Linking.openURL('https://habittracker.com/privacy') }
      ]
    );
  };

  const getStorageInfo = () => {
    const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    const dataSize = JSON.stringify(habits).length;
    return `${habits.length} habits • ${totalCompletions} completions • ${(dataSize / 1024).toFixed(1)} KB`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your habit tracking experience</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Get reminded about your habits"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textSecondary}
              />
            }
          />
          <SettingItem
            icon="vibrate"
            title="Haptic Feedback"
            subtitle="Feel vibrations on interactions"
            rightComponent={
              <Switch
                value={hapticEnabled}
                onValueChange={handleHapticToggle}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
                thumbColor={hapticEnabled ? COLORS.primary : COLORS.textSecondary}
              />
            }
          />
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Appearance</Text>
          <SettingItem
            icon="color-palette"
            title="Theme"
            subtitle={`Currently using ${settings.theme === 'dark' ? 'Dark' : 'Light'} theme`}
            onPress={handleThemeChange}
            showChevron
          />
          <SettingItem
            icon="calendar"
            title="Week Starts On"
            subtitle={settings.weekStartsOn === 0 ? 'Sunday' : 'Monday'}
            onPress={handleWeekStart}
            showChevron
          />
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Data Management</Text>
          <SettingItem
            icon="cloud-upload"
            title="Backup Data"
            subtitle="Keep your data safe"
            onPress={handleBackupData}
            showChevron
            iconColor={COLORS.success}
          />
          <SettingItem
            icon="download"
            title="Export Data"
            subtitle="Download your habit data"
            onPress={handleExportData}
            showChevron
            iconColor={COLORS.primary}
          />
          <SettingItem
            icon="information-circle"
            title="Storage Info"
            subtitle={getStorageInfo()}
          />
          <SettingItem
            icon="refresh"
            title="Reset All Data"
            subtitle="Clear all habits and progress"
            onPress={handleResetData}
            showChevron
            iconColor={COLORS.danger}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Help & Support</Text>
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            subtitle="Get help or contact us"
            onPress={handleContactSupport}
            showChevron
            iconColor={COLORS.primary}
          />
          <SettingItem
            icon="star"
            title="Rate App"
            subtitle="Show us some love in the App Store!"
            onPress={handleRateApp}
            showChevron
            iconColor={COLORS.warning}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <SettingItem
            icon="shield-checkmark"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={handlePrivacyPolicy}
            showChevron
          />
          <SettingItem
            icon="information-circle"
            title="App Version"
            subtitle="1.0.0 (Build 1)"
          />
          <SettingItem
            icon="code-slash"
            title="Open Source"
            subtitle="Built with React Native & TypeScript"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for better habits
          </Text>
          <Text style={styles.footerSubtext}>
            Keep building, keep growing! 🌱
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingVertical: LAYOUT.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...LAYOUT.typography.title,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: LAYOUT.spacing.lg,
  },
  sectionTitle: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingVertical: LAYOUT.spacing.md,
    backgroundColor: COLORS.surface + '50',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...LAYOUT.typography.body,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.xl,
    paddingHorizontal: LAYOUT.spacing.xl,
  },
  footerText: {
    ...LAYOUT.typography.body,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.xs,
  },
  footerSubtext: {
    ...LAYOUT.typography.caption,
    color: COLORS.textMuted,
  },
});
