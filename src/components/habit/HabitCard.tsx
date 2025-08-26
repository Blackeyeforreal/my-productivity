// src/components/habit/HabitCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../../../types';
import { COLORS, LAYOUT } from '../../../constants/colors';
import CompletionControl from './CompletionControl';
import StreakBadge from './StreakBadge';

interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export default function HabitCard({ habit, onPress, onEdit, onDelete }: HabitCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayCompletion = habit.completionData[today];
  const isCompleted = todayCompletion?.completed || false;

  const getNextReminderTime = () => {
    if (habit.reminders.length === 0) return null;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const nextReminder = habit.reminders
      .filter(r => r.enabled && r.time > currentTime)
      .sort((a, b) => a.time.localeCompare(b.time))[0];
    
    return nextReminder?.time;
  };

  const showContextMenu = () => {
    Alert.alert(
      habit.name,
      'Choose an action',
      [
        { text: 'Edit', onPress: onEdit },
        { text: 'Delete', onPress: onDelete, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getGoalProgress = () => {
    if (habit.goalType === 'check') return null;
    const targetValue = habit.targetValue || 0;
    const currentValue = todayCompletion?.value || 0;
    const percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
    
    return {
      current: currentValue,
      target: targetValue,
      percentage: Math.min(percentage, 100),
      unit: habit.targetUnit || (habit.goalType === 'duration' ? 'min' : 'reps')
    };
  };

  const goalProgress = getGoalProgress();
  const nextReminder = getNextReminderTime();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.colorIndicator, { backgroundColor: habit.color }]} />
      
      <CompletionControl
        habit={habit}
        isCompleted={isCompleted}
        onToggle={onPress}
        progress={goalProgress}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, isCompleted && styles.completedText]}>
            {habit.name}
          </Text>
          <StreakBadge streak={habit.streak} />
        </View>
        
        {goalProgress && (
          <View style={styles.goalProgress}>
            <Text style={styles.goalText}>
              {goalProgress.current}/{goalProgress.target} {goalProgress.unit}
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    width: `${goalProgress.percentage}%`,
                    backgroundColor: habit.color 
                  }
                ]} 
              />
            </View>
          </View>
        )}
        
        {nextReminder && (
          <View style={styles.reminder}>
            <Ionicons name="alarm-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.reminderText}>Next: {nextReminder}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.menuButton} onPress={showContextMenu}>
        <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    marginBottom: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: LAYOUT.spacing.md,
  },
  content: {
    flex: 1,
    marginLeft: LAYOUT.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.spacing.xs,
  },
  name: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: LAYOUT.spacing.sm,
  },
  completedText: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  goalProgress: {
    marginBottom: LAYOUT.spacing.xs,
  },
  goalText: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.xs,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  reminderText: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
  },
  menuButton: {
    padding: LAYOUT.spacing.sm,
    marginLeft: LAYOUT.spacing.sm,
  },
});
