// src/components/insights/WeeklyCompletionCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useHabits } from '../../../context/HabitContext';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface WeeklyCompletionCardProps {
  timeRange: string;
}

export default function WeeklyCompletionCard({ timeRange }: WeeklyCompletionCardProps) {
  const { habits } = useHabits();

  const getWeeklyData = () => {
    const now = new Date();
    const weekData = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayCompletions = habits.reduce((sum, habit) => 
        sum + (habit.completedDates.includes(dateStr) ? 1 : 0), 0
      );
      
      const totalHabits = habits.filter(h => h.isActive).length;
      const percentage = totalHabits > 0 ? (dayCompletions / totalHabits) * 100 : 0;
      
      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        percentage: Math.round(percentage),
        completions: dayCompletions,
        total: totalHabits,
        isToday: dateStr === now.toISOString().split('T')[0],
      });
    }
    
    return weekData;
  };

  const weekData = getWeeklyData();
  const averageCompletion = Math.round(
    weekData.reduce((sum, day) => sum + day.percentage, 0) / weekData.length
  );

  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return COLORS.success;
    if (percentage >= 75) return COLORS.primary;
    if (percentage >= 50) return COLORS.warning;
    if (percentage >= 25) return COLORS.danger + '80';
    return COLORS.textMuted;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly Progress</Text>
          <Text style={styles.subtitle}>Last 7 days completion</Text>
        </View>
        <View style={styles.averageContainer}>
          <Text style={styles.averageValue}>{averageCompletion}%</Text>
          <Text style={styles.averageLabel}>avg</Text>
        </View>
      </View>
      
      <View style={styles.chart}>
        {weekData.map((day, index) => (
          <View key={index} style={styles.dayColumn}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.dayBar,
                  {
                    height: `${Math.max(day.percentage, 4)}%`,
                    backgroundColor: getBarColor(day.percentage),
                  }
                ]}
              />
            </View>
            <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>
              {day.day}
            </Text>
            <Text style={[styles.dateLabel, day.isToday && styles.todayDate]}>
              {day.date}
            </Text>
            <Text style={styles.percentageLabel}>{day.percentage}%</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendText}>Excellent (90%+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Good (75%+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
          <Text style={styles.legendText}>Fair (50%+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.danger + '80' }]} />
          <Text style={styles.legendText}>Poor (25%+)</Text>
        </View>
      </View>
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.spacing.lg,
  },
  title: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
  },
  averageContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.sm,
  },
  averageValue: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  averageLabel: {
    ...LAYOUT.typography.small,
    color: COLORS.primary,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: LAYOUT.spacing.lg,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  barContainer: {
    height: 80,
    width: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dayBar: {
    width: 20,
    borderRadius: 2,
    minHeight: 4,
  },
  dayLabel: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  todayLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  dateLabel: {
    ...LAYOUT.typography.small,
    color: COLORS.textMuted,
  },
  todayDate: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  percentageLabel: {
    ...LAYOUT.typography.small,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
    marginTop: LAYOUT.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
  },
});
