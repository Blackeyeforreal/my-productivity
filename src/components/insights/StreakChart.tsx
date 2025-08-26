// src/components/insights/StreakChart.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useHabits } from '../../../context/HabitContext';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface StreakChartProps {
  timeRange: string;
}

export default function StreakChart({ timeRange }: StreakChartProps) {
  const { habits } = useHabits();

  const getStreakData = () => {
    // Calculate streak progression over time
    const now = new Date();
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const streakData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate average streak for this day
      const totalStreaks = habits.reduce((sum, habit) => {
        // Simple streak calculation for the day
        const completedOnDay = habit.completedDates.includes(dateStr);
        return sum + (completedOnDay ? 1 : 0);
      }, 0);
      
      const avgStreak = habits.length > 0 ? totalStreaks / habits.length : 0;
      
      streakData.push({
        date: dateStr,
        dayLabel: date.getDate().toString(),
        avgStreak: Math.round(avgStreak * 100), // Convert to percentage
      });
    }

    return streakData;
  };

  const data = getStreakData();
  const maxStreak = Math.max(...data.map(d => d.avgStreak), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Streak Progression</Text>
      <Text style={styles.subtitle}>Daily completion trends</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(item.avgStreak / maxStreak) * 100}%`,
                    backgroundColor: item.avgStreak >= 75 
                      ? COLORS.success 
                      : item.avgStreak >= 50 
                      ? COLORS.warning 
                      : COLORS.danger,
                  }
                ]}
              />
              <Text style={styles.barLabel}>{item.dayLabel}</Text>
            </View>
          ))}
        </View>
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
  chartContainer: {
    marginHorizontal: -LAYOUT.spacing.lg,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  barContainer: {
    alignItems: 'center',
    marginRight: LAYOUT.spacing.sm,
    width: 24,
  },
  bar: {
    width: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: LAYOUT.spacing.xs,
    minHeight: 4,
  },
  barLabel: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
  },
});
