// screens/TodayScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHabits } from '../context/HabitContext';
import { COLORS, LAYOUT } from '../constants/colors';
import { Habit } from '../types';

// Components
import ProgressHeader from '../src/components/habit/ProgressHeader';
import HabitCard from '../src/components/habit/HabitCard';
import FAB from '../src/components/navigation/FAB';
import EmptyState from '../src/components/common/EmptyState';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';


// src/screens/today/TodayScreen.tsx

import InputDialog from '../src/components/common/InputDialog'; // ✅ Import custom dialog

type FilterType = 'all' | 'completed' | 'missed' | 'reminders';
type TodayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export default function TodayScreen() {
  const navigation = useNavigation<TodayScreenNavigationProp>();
  const { getHabitsForDate, toggleHabitCompletion } = useHabits();
  const [filter, setFilter] = useState<FilterType>('all');
  
  // ✅ Add state for custom input dialog
  const [inputDialog, setInputDialog] = useState({
    visible: false,
    habit: null as Habit | null,
    title: '',
    message: '',
    placeholder: '',
    defaultValue: '',
  });
  // state
const [notifSheetOpen, setNotifSheetOpen] = useState(false);
const [busy, setBusy] = useState(false);

// get from your context/services
const { settings, updateSettings, habits } = useHabits();

// helper: request OS permission (stub; implement in your NotificationService)
async function ensureOsPermission(): Promise<boolean> {
  // return await NotificationService.requestPermission(); // implement per platform or Expo
  return true;
}

// helper: schedule/cancel (stubs; implement according to your scheduler)
async function rescheduleAllRemindersForActiveHabits() {
  // iterate habits, schedule reminders from their reminders[] times
}
async function cancelAllScheduledReminders() {
  // cancel all pending notifications
}
async function snoozeAllTodayBy(minutes: number) {
  // find next occurrences for today and push them by {minutes}
}

// handlers
const handleToggleNotifications = async () => {
  if (busy) return;
  setBusy(true);
  try {
    const next = !settings.notifications;
    if (next) {
      const granted = await ensureOsPermission();
      if (!granted) {
        // show a toast/toast-like message in your app to inform user to enable at OS level
        setBusy(false);
        setNotifSheetOpen(false);
        return;
      }
      await updateSettings({ notifications: true });
      await rescheduleAllRemindersForActiveHabits();
    } else {
      await updateSettings({ notifications: false });
      await cancelAllScheduledReminders();
    }
  } finally {
    setBusy(false);
    setNotifSheetOpen(false);
  }
};

const handleEditReminders = () => {
  setNotifSheetOpen(false);
  // Option: navigate to a dedicated Reminders screen
  // Or open Add/Edit Habit with a param to focus reminders UI
  navigation.navigate('AddEditHabit'); // you can pass { focus: 'reminders' }
};

const handleSnoozeAll = async () => {
  if (busy) return;
  setBusy(true);
  try {
    await snoozeAllTodayBy(60);
  } finally {
    setBusy(false);
    setNotifSheetOpen(false);
  }
};
const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  grabber: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, marginBottom: 8,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  text: { ...LAYOUT.typography.body, color: COLORS.textPrimary },
  cancel: {
    marginTop: 8, paddingVertical: 12, alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: 12,
  },
  cancelText: { ...LAYOUT.typography.body, color: COLORS.textSecondary },
});

  const today = new Date().toISOString().split('T')[0];
  const todaysHabits = getHabitsForDate(today);

  const filteredHabits = todaysHabits.filter(habit => {
    const isCompleted = habit.completionData[today]?.completed || false;
    
    switch (filter) {
      case 'completed':
        return isCompleted;
      case 'missed':
        return !isCompleted;
      case 'reminders':
        return habit.reminders.length > 0;
      default:
        return true;
    }
  });

  const handleHabitPress = (habit: Habit) => {
    if (habit.goalType === 'check') {
      toggleHabitCompletion(habit.id);
    } else {
      openGoalInput(habit);
    }
  };

  // ✅ Replace Alert.prompt with custom dialog
  const openGoalInput = (habit: Habit) => {
    const currentValue = habit.completionData[today]?.value;
    const goalTypeLabel = habit.goalType === 'count' ? 'count' : 'duration (minutes)';
    const unit = habit.targetUnit || (habit.goalType === 'duration' ? 'minutes' : 'reps');
    
    setInputDialog({
      visible: true,
      habit,
      title: habit.name,
      message: `Enter ${goalTypeLabel}:`,
      placeholder: `Target: ${habit.targetValue || 1} ${unit}`,
      defaultValue: currentValue?.toString() || '',
    });
  };

  // ✅ Handle input dialog submission
  const handleInputSubmit = (value: string) => {
    if (inputDialog.habit) {
      const numValue = parseInt(value) || 0;
      if (numValue > 0) {
        toggleHabitCompletion(inputDialog.habit.id, today, numValue);
      }
    }
    setInputDialog({ ...inputDialog, visible: false, habit: null });
  };

  // ✅ Handle input dialog cancellation
  const handleInputCancel = () => {
    setInputDialog({ ...inputDialog, visible: false, habit: null });
  };

  const handleAddHabit = () => {
    navigation.navigate('AddEditHabit');
  };

  const handleEditHabit = (habitId: string) => {
    navigation.navigate('AddEditHabit', { habitId });
  };

  const renderFilter = (filterType: FilterType, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
      onPress={() => setFilter(filterType)}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={filter === filterType ? COLORS.primary : COLORS.textSecondary} 
      />
      <Text style={[
        styles.filterButtonText, 
        filter === filterType && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Today</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => setNotifSheetOpen(true)}>
  <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
</TouchableOpacity>

      </View>

      {/* Progress Summary */}
      <ProgressHeader />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {renderFilter('all', 'All', 'list-outline')}
        {renderFilter('completed', 'Done', 'checkmark-circle-outline')}
        {renderFilter('missed', 'Missed', 'close-circle-outline')}
        {renderFilter('reminders', 'Reminders', 'alarm-outline')}
      </View>

      {/* Habits List */}
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HabitCard 
            habit={item} 
            onPress={() => handleHabitPress(item)}
            onEdit={() => handleEditHabit(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="list-outline"
            title="No habits yet"
            subtitle="Create your first habit to get started"
            actionText="Add Habit"
            onAction={handleAddHabit}
          />
        }
      />

      {/* Floating Action Button */}
      <FAB 
        icon="add" 
        onPress={handleAddHabit}
      />

      {/* ✅ Custom Input Dialog */}
      <InputDialog
        visible={inputDialog.visible}
        title={inputDialog.title}
        message={inputDialog.message}
        placeholder={inputDialog.placeholder}
        defaultValue={inputDialog.defaultValue}
        keyboardType="numeric"
        onSubmit={handleInputSubmit}
        onCancel={handleInputCancel}
      />

      <Modal transparent visible={notifSheetOpen} animationType="fade" onRequestClose={() => setNotifSheetOpen(false)}>
  <TouchableOpacity activeOpacity={1} style={sheetStyles.backdrop} onPress={() => setNotifSheetOpen(false)}>
    <View />
  </TouchableOpacity>

  <View style={sheetStyles.sheet}>
    <View style={sheetStyles.grabber} />

    <TouchableOpacity style={sheetStyles.item} onPress={handleToggleNotifications} disabled={busy}>
      <Ionicons name={settings.notifications ? 'notifications-off' : 'notifications'} size={18} color={COLORS.primary} />
      <Text style={sheetStyles.text}>
        {settings.notifications ? 'Disable notifications' : 'Enable notifications'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={sheetStyles.item} onPress={handleEditReminders} disabled={busy}>
      <Ionicons name="alarm" size={18} color={COLORS.textPrimary} />
      <Text style={sheetStyles.text}>Edit reminders</Text>
    </TouchableOpacity>

    <TouchableOpacity style={sheetStyles.item} onPress={handleSnoozeAll} disabled={busy || !settings.notifications}>
      <Ionicons name="time" size={18} color={settings.notifications ? COLORS.textPrimary : COLORS.textSecondary} />
      <Text style={[sheetStyles.text, !settings.notifications && { color: COLORS.textSecondary }]}>
        Snooze all for 1 hour
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={sheetStyles.cancel} onPress={() => setNotifSheetOpen(false)} disabled={busy}>
      <Text style={sheetStyles.cancelText}>Cancel</Text>
    </TouchableOpacity>
  </View>
</Modal>

    </SafeAreaView>
  );
}

// Styles remain the same as before...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingVertical: LAYOUT.spacing.lg,
  },
  headerTitle: {
    ...LAYOUT.typography.title,
    color: COLORS.textPrimary,
  },
  headerDate: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    padding: LAYOUT.spacing.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingBottom: LAYOUT.spacing.lg,
    gap: LAYOUT.spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.xl,
    backgroundColor: COLORS.surface,
    gap: LAYOUT.spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primaryLight + '20',
  },
  filterButtonText: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.primary,
  },
  listContainer: {
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingBottom: 100,
  },
});
