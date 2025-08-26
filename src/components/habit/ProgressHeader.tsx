// src/components/headers/ProgressHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useHabits } from '../../../context/HabitContext';
import { COLORS, LAYOUT } from '../../../constants/colors';

export default function ProgressHeader() {
  const { getTodaysProgress } = useHabits();
  const { completed, total, percentage } = getTodaysProgress();

  return (
    <View style={styles.container}>
      <View style={styles.progressRing}>
        <View style={[styles.ringBackground, { borderColor: COLORS.border }]}>
          {percentage > 0 && (
            <View
              style={[
                styles.ringProgress,
                {
                  borderTopColor: COLORS.primary,
                  transform: [{ rotate: `${(percentage / 100) * 360}deg` }],
                },
              ]}
            />
          )}
          <View style={styles.ringInner}>
            <Text style={styles.percentageText}>{percentage}%</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.completedText}>
          {completed} of {total} completed
        </Text>
        <Text style={styles.motivationText}>
          {percentage === 100 
            ? "Perfect day! 🎉" 
            : percentage >= 75 
            ? "Almost there! 💪"
            : percentage >= 50 
            ? "Great progress! 🌟"
            : "Keep going! 🚀"
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingVertical: LAYOUT.spacing.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.md,
    marginBottom: LAYOUT.spacing.lg,
  },
  progressRing: {
    marginRight: LAYOUT.spacing.lg,
  },
  ringBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringProgress: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  ringInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  completedText: {
    ...LAYOUT.typography.body,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.xs,
  },
  motivationText: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
  },
});
