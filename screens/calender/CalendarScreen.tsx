// src/screens/calendar/CalendarScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../../context/HabitContext';
import { COLORS, LAYOUT } from '../../constants/colors';
import { Habit } from '../../types';

export default function CalendarScreen() {
  const { habits, getHabitsForDate, toggleHabitCompletion } = useHabits();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  const getMarkedDates = () => {
    const marked: any = {};
    
    if (selectedHabit) {
      const habit = habits.find(h => h.id === selectedHabit);
      if (habit) {
        habit.completedDates.forEach(date => {
          marked[date] = {
            selected: true,
            selectedColor: habit.color,
          };
        });
      }
    } else {
      habits.forEach(habit => {
        habit.completedDates.forEach(date => {
          if (!marked[date]) {
            marked[date] = { dots: [] };
          }
          marked[date].dots.push({
            color: habit.color,
          });
        });
      });
    }

    // Highlight selected date
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: COLORS.primary,
    };

    return marked;
  };

  const renderHabitFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
    >
      <TouchableOpacity
        style={[styles.filterChip, !selectedHabit && styles.activeChip]}
        onPress={() => setSelectedHabit(null)}
      >
        <Text style={[styles.filterText, !selectedHabit && styles.activeFilterText]}>
          All Habits
        </Text>
      </TouchableOpacity>
      
      {habits.map(habit => (
        <TouchableOpacity
          key={habit.id}
          style={[styles.filterChip, selectedHabit === habit.id && styles.activeChip]}
          onPress={() => setSelectedHabit(habit.id)}
        >
          <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
          <Text style={[
            styles.filterText, 
            selectedHabit === habit.id && styles.activeFilterText
          ]}>
            {habit.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDayDetails = () => {
    const dateHabits = getHabitsForDate(selectedDate);
    
    return (
      <View style={styles.dayDetails}>
        <Text style={styles.dayTitle}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        
        {dateHabits.map(habit => {
          const isCompleted = habit.completionData[selectedDate]?.completed || false;
          const completionValue = habit.completionData[selectedDate]?.value;
          
          return (
            <TouchableOpacity
              key={habit.id}
              style={[styles.habitItem, isCompleted && styles.completedItem]}
              onPress={() => toggleHabitCompletion(habit.id, selectedDate)}
            >
              <View style={[styles.colorIndicator, { backgroundColor: habit.color }]} />
              <View style={styles.habitInfo}>
                <Text style={[styles.habitName, isCompleted && styles.completedText]}>
                  {habit.name}
                </Text>
                {completionValue && (
                  <Text style={styles.completionValue}>
                    {completionValue} {habit.targetUnit || (habit.goalType === 'duration' ? 'min' : 'reps')}
                  </Text>
                )}
              </View>
              <Ionicons
                name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={isCompleted ? habit.color : COLORS.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
        
        {dateHabits.length === 0 && (
          <Text style={styles.emptyText}>No habits for this date</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>
      
      <ScrollView>
        {renderHabitFilters()}
        
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={getMarkedDates()}
        markingType={selectedHabit ? undefined : 'multi-dot' as any}
          theme={{
            backgroundColor: COLORS.background,
            calendarBackground: COLORS.surface,
            textSectionTitleColor: COLORS.textSecondary,
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: COLORS.textPrimary,
            todayTextColor: COLORS.primary,
            dayTextColor: COLORS.textPrimary,
            textDisabledColor: COLORS.textMuted,
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.textPrimary,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
          }}
          style={styles.calendar}
        />
        
        {renderDayDetails()}
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
  },
  title: {
    ...LAYOUT.typography.title,
    color: COLORS.textPrimary,
  },
  filtersContainer: {
    paddingHorizontal: LAYOUT.spacing.xl,
    marginBottom: LAYOUT.spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.xl,
    marginRight: LAYOUT.spacing.sm,
    gap: LAYOUT.spacing.xs,
  },
  activeChip: {
    backgroundColor: COLORS.primary + '20',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.primary,
  },
  calendar: {
    marginHorizontal: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.md,
    marginBottom: LAYOUT.spacing.lg,
  },
  dayDetails: {
    marginHorizontal: LAYOUT.spacing.xl,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.spacing.lg,
  },
  dayTitle: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.lg,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.md,
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.radius.sm,
    marginBottom: LAYOUT.spacing.sm,
  },
  completedItem: {
    backgroundColor: COLORS.success + '10',
  },
  colorIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: LAYOUT.spacing.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    ...LAYOUT.typography.body,
    color: COLORS.textPrimary,
  },
  completedText: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  completionValue: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    ...LAYOUT.typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: LAYOUT.spacing.xl,
  },
});
