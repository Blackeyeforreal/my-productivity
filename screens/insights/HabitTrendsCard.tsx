// src/components/insights/HabitTrendsCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Habit } from '../../types';
import { COLORS, LAYOUT } from '../../constants/colors';

interface HabitTrendsCardProps {
  habits: Habit[];
  timeRange: string;
}

export default function HabitTrendsCard({ habits, timeRange }: HabitTrendsCardProps) {
  const getHabitTrends = () => {
    const now = new Date();
    let daysToCheck = 30; // Default to month
    
    switch (timeRange) {
      case 'week': daysToCheck = 7; break;
      case 'month': daysToCheck = 30; break;
      case '3months': daysToCheck = 90; break;
      case 'year': daysToCheck = 365; break;
    }

    return habits.map(habit => {
      const recentCompletions = habit.completedDates.filter(date => {
        const completionDate = new Date(date);
        const daysDiff = (now.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= daysToCheck;
      }).length;

      const completionRate = daysToCheck > 0 ? (recentCompletions / daysToCheck) * 100 : 0;

      return {
        ...habit,
        recentCompletions,
        completionRate: Math.round(completionRate),
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  };

  const trendData = getHabitTrends();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Performance</Text>
      <Text style={styles.subtitle}>Completion rates for this {timeRange}</Text>
      
      <ScrollView style={styles.habitsList} showsVerticalScrollIndicator={false}>
        {trendData.map(habit => (
          <View key={habit.id} style={styles.habitTrend}>
            <View style={styles.habitInfo}>
              <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
              <View style={styles.habitText}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitStats}>
                  {habit.recentCompletions} completions • 🔥 {habit.streak}
                </Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${habit.completionRate}%`,
                      backgroundColor: habit.color,
                    }
                  ]}
                />
              </View>
              <Text style={styles.percentage}>{habit.completionRate}%</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    marginHorizontal: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.lg,
  },
  title: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.xs,
  },
  subtitle: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.lg,
  },
  habitsList: {
    maxHeight: 300,
  },
  habitTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  habitInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.lg,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: LAYOUT.spacing.sm,
  },
  habitText: {
    flex: 1,
  },
  habitName: {
    ...LAYOUT.typography.body,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  habitStats: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: LAYOUT.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  percentage: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
