// src/components/habit/CompletionControl.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../../../types';
import { COLORS } from '../../../constants/colors';

interface CompletionControlProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  progress?: {
    current: number;
    target: number;
    percentage: number;
    unit: string;
  } | null;
}

export default function CompletionControl({
  habit,
  isCompleted,
  onToggle,
  progress,
}: CompletionControlProps) {
  const getIcon = () => {
    if (habit.goalType === 'check') {
      return isCompleted ? 'checkmark-circle' : 'ellipse-outline';
    }
    
    if (progress && progress.percentage === 100) {
      return 'checkmark-circle';
    }
    
    return habit.goalType === 'count' ? 'add-circle-outline' : 'timer-outline';
  };

  const getColor = () => {
    if (isCompleted || (progress && progress.percentage === 100)) {
      return habit.color;
    }
    return COLORS.textSecondary;
  };

  if (habit.goalType !== 'check' && progress) {
    return (
      <TouchableOpacity style={styles.progressRing} onPress={onToggle}>
        <View style={[styles.ringBackground, { borderColor: COLORS.border }]}>
          <View
            style={[
              styles.ringProgress,
              {
                borderColor: habit.color,
                transform: [{ rotate: `${(progress.percentage / 100) * 360}deg` }],
              },
            ]}
          />
          <Ionicons
            name={getIcon() as any}
            size={20}
            color={getColor()}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onToggle}>
      <Ionicons
        name={getIcon() as any}
        size={32}
        color={getColor()}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  progressRing: {
    padding: 4,
  },
  ringBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringProgress: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
