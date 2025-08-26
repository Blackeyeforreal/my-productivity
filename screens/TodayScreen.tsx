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
  const { habits, getHabitsForDate, toggleHabitCompletion } = useHabits();
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
        <TouchableOpacity style={styles.notificationButton}>
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
