// src/screens/insights/InsightsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../../context/HabitContext';
import { COLORS, LAYOUT } from '../../constants/colors';

// Components
import StatCard from '../../src/components/insights/StatCard';
import WeeklyCompletionCard from '../../src/components/insights/WeeklyCompletionCard';
import HabitTrendsCard from '../../src/components/insights/HabitTrendsCard';
import StreakChart from '../../src/components/insights/StreakChart';
import CompletionHeatmap from '../../src/components/insights/CompletionHeatMap';
import ProgressChart from '../../src/components/insights/ProgressChart';
import AchievementCard from '../../src/components/insights/AchievementCard';

type TimeRange = 'week' | 'month' | '3months' | 'year';

export default function InsightsScreen() {
  const { habits } = useHabits();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const getInsightsData = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    let startDate: Date;
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.isActive).length;
    const totalCompletions = habits.reduce((sum, habit) => 
      sum + habit.completedDates.filter(date => date >= startDate.toISOString().split('T')[0]).length, 0
    );
    
    const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);
    const currentStreaks = habits.reduce((sum, h) => sum + (h.streak > 0 ? 1 : 0), 0);
    
    const daysInRange = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const possibleCompletions = activeHabits * daysInRange;
    const completionRate = possibleCompletions > 0 ? Math.round((totalCompletions / possibleCompletions) * 100) : 0;

    const mostConsistentHabit = habits.reduce((best, habit) => {
      if (habit.completedDates.length === 0) return best;
      const habitRate = habit.completedDates.filter(date => date >= startDate.toISOString().split('T')[0]).length;
// ✅ Fixed: Explicitly type the 'date' parameter
const bestRate = best ? best.completedDates.filter((date: string) => date >= startDate.toISOString().split('T')[0]).length : 0;
      return habitRate > bestRate ? habit : best;
    }, null as any);

    return {
      totalHabits,
      activeHabits,
      totalCompletions,
      completionRate,
      longestStreak,
      currentStreaks,
      mostConsistentHabit,
    };
  };

  const getProgressData = () => {
    const categories = ['morning', 'afternoon', 'evening', 'anytime'];
    return categories.map(category => {
      const categoryHabits = habits.filter(h => h.category === category);
      const completed = categoryHabits.filter(h => h.streak > 0).length;
      
      return {
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: completed,
        total: categoryHabits.length,
        color: category === 'morning' ? COLORS.warning : 
               category === 'afternoon' ? COLORS.primary :
               category === 'evening' ? COLORS.success : COLORS.textSecondary,
        icon: category === 'morning' ? 'sunny' : 
              category === 'afternoon' ? 'partly-sunny' :
              category === 'evening' ? 'moon' : 'time',
      };
    }).filter(item => item.total > 0);
  };

  const getAchievements = () => {
    const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    const maxStreak = Math.max(...habits.map(h => h.longestStreak), 0);
    
    return [
      {
        id: 'first_habit',
        title: 'First Steps',
        description: 'Create your first habit',
        icon: 'add-circle',
        color: COLORS.primary,
        unlocked: habits.length > 0,
      },
      {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: 'flame',
        color: COLORS.warning,
        unlocked: maxStreak >= 7,
        progress: Math.min(maxStreak, 7),
        target: 7,
      },
      {
        id: 'completionist',
        title: 'Completionist',
        description: 'Complete 100 habits',
        icon: 'trophy',
        color: COLORS.success,
        unlocked: totalCompletions >= 100,
        progress: Math.min(totalCompletions, 100),
        target: 100,
      },
      {
        id: 'month_streak',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: 'star',
        color: COLORS.primary,
        unlocked: maxStreak >= 30,
        progress: Math.min(maxStreak, 30),
        target: 30,
      },
    ];
  };

  const data = getInsightsData();
  const progressData = getProgressData();
  const achievements = getAchievements();

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['week', 'month', '3months', 'year'] as TimeRange[]).map(range => (
        <TouchableOpacity
          key={range}
          style={[styles.timeRangeButton, timeRange === range && styles.activeTimeRange]}
          onPress={() => setTimeRange(range)}
        >
          <Text style={[
            styles.timeRangeText,
            timeRange === range && styles.activeTimeRangeText
          ]}>
            {range === '3months' ? '3M' : range === 'year' ? '1Y' : range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewCards = () => (
    <View style={styles.overviewGrid}>
      <StatCard
        title="Completion Rate"
        value={`${data.completionRate}%`}
        icon="analytics"
        color={COLORS.primary}
        trend={data.completionRate >= 75 ? 'up' : data.completionRate >= 50 ? 'neutral' : 'down'}
      />
      <StatCard
        title="Current Streaks"
        value={data.currentStreaks.toString()}
        icon="flame"
        color={COLORS.warning}
        subtitle={`of ${data.activeHabits} habits`}
      />
      <StatCard
        title="Longest Streak"
        value={data.longestStreak.toString()}
        icon="trophy"
        color={COLORS.success}
        subtitle="days"
      />
      <StatCard
        title="Total Completions"
        value={data.totalCompletions.toString()}
        icon="checkmark-circle"
        color={COLORS.primary}
        subtitle="this period"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Track your progress and patterns</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTimeRangeSelector()}
        {renderOverviewCards()}

        <WeeklyCompletionCard timeRange={timeRange} />
        
        <StreakChart timeRange={timeRange} />
        
        {progressData.length > 0 && (
          <ProgressChart data={progressData} />
        )}
        
        <CompletionHeatmap timeRange={timeRange} />
        
        <AchievementCard achievements={achievements} />
        
        {data.mostConsistentHabit && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Most Consistent Habit</Text>
            <View style={styles.consistentHabit}>
              <View style={[styles.habitColorDot, { backgroundColor: data.mostConsistentHabit.color }]} />
              <View style={styles.consistentHabitInfo}>
                <Text style={styles.consistentHabitName}>
                  {data.mostConsistentHabit.name}
                </Text>
                <Text style={styles.consistentHabitStats}>
                  🔥 {data.mostConsistentHabit.streak} day streak
                </Text>
              </View>
              <Ionicons name="trophy" size={24} color={COLORS.warning} />
            </View>
          </View>
        )}

        <HabitTrendsCard habits={habits} timeRange={timeRange} />

        <View style={styles.footer} />
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
  subtitle: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.md,
    padding: 4,
    marginBottom: LAYOUT.spacing.lg,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.sm,
    alignItems: 'center',
    borderRadius: LAYOUT.radius.sm,
  },
  activeTimeRange: {
    backgroundColor: COLORS.primary,
  },
  timeRangeText: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTimeRangeText: {
    color: 'white',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: LAYOUT.spacing.xl,
    gap: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.lg,
  },
  cardTitle: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.lg,
  },
  consistentHabit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: LAYOUT.spacing.md,
  },
  consistentHabitInfo: {
    flex: 1,
  },
  consistentHabitName: {
    ...LAYOUT.typography.body,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  consistentHabitStats: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
  },
  footer: {
    height: 20,
  },
});
