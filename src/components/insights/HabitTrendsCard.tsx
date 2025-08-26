// src/components/insights/HabitTrendsCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../../../types';
import { COLORS, LAYOUT } from '../../../constants/colors';

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

      // Calculate trend (comparing first half vs second half of period)
      const halfPeriod = Math.floor(daysToCheck / 2);
      const recentHalf = habit.completedDates.filter(date => {
        const completionDate = new Date(date);
        const daysDiff = (now.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= halfPeriod;
      }).length;
      
      const olderHalf = habit.completedDates.filter(date => {
        const completionDate = new Date(date);
        const daysDiff = (now.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > halfPeriod && daysDiff <= daysToCheck;
      }).length;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentHalf > olderHalf) trend = 'up';
      else if (recentHalf < olderHalf) trend = 'down';

      return {
        ...habit,
        recentCompletions,
        completionRate: Math.round(completionRate),
        trend,
        trendValue: recentHalf - olderHalf,
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  };

  const trendData = getHabitTrends();
  
  const getPerformanceLevel = (rate: number) => {
    if (rate >= 90) return { level: 'Excellent', color: COLORS.success };
    if (rate >= 75) return { level: 'Great', color: COLORS.primary };
    if (rate >= 50) return { level: 'Good', color: COLORS.warning };
    if (rate >= 25) return { level: 'Fair', color: COLORS.danger + '80' };
    return { level: 'Needs Work', color: COLORS.textMuted };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  if (trendData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Habit Performance</Text>
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Habits Yet</Text>
          <Text style={styles.emptySubtitle}>Add some habits to see performance trends</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Habit Performance</Text>
          <Text style={styles.subtitle}>
            Completion rates for {timeRange === '3months' ? '3 months' : timeRange}
          </Text>
        </View>
        <View style={styles.summaryStats}>
          <Text style={styles.statValue}>
            {Math.round(trendData.reduce((sum, h) => sum + h.completionRate, 0) / trendData.length)}%
          </Text>
          <Text style={styles.statLabel}>avg rate</Text>
        </View>
      </View>
      
      <ScrollView style={styles.habitsList} showsVerticalScrollIndicator={false}>
        {trendData.map((habit, index) => {
          const performance = getPerformanceLevel(habit.completionRate);
          
          return (
            <View key={habit.id} style={styles.habitTrend}>
              <View style={styles.rankContainer}>
                <Text style={styles.rank}>#{index + 1}</Text>
              </View>
              
              <View style={styles.habitInfo}>
                <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
                <View style={styles.habitDetails}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <View style={styles.habitStats}>
                    <Text style={styles.completionsText}>
                      {habit.recentCompletions} completions
                    </Text>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.streakText}>
                      🔥 {habit.streak} streak
                    </Text>
                    {habit.longestStreak > habit.streak && (
                      <>
                        <Text style={styles.separator}>•</Text>
                        <Text style={styles.bestStreakText}>
                          Best: {habit.longestStreak}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.performanceContainer}>
                <View style={styles.trendContainer}>
                  <Ionicons 
                    name={getTrendIcon(habit.trend) as any} 
                    size={12} 
                    color={getTrendColor(habit.trend)} 
                  />
                  <Text style={[styles.trendText, { color: getTrendColor(habit.trend) }]}>
                    {habit.trendValue > 0 ? `+${habit.trendValue}` : habit.trendValue}
                  </Text>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${habit.completionRate}%`,
                          backgroundColor: performance.color,
                        }
                      ]}
                    />
                  </View>
                  <View style={styles.rateContainer}>
                    <Text style={[styles.percentage, { color: performance.color }]}>
                      {habit.completionRate}%
                    </Text>
                    <Text style={[styles.performanceLevel, { color: performance.color }]}>
                      {performance.level}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Tip: Habits with consistent daily practice show better long-term results
        </Text>
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
    marginBottom: LAYOUT.spacing.xs,
  },
  subtitle: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
  },
  summaryStats: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.sm,
  },
  statValue: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
  },
  habitsList: {
    maxHeight: 400,
  },
  habitTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.sm,
    backgroundColor: COLORS.background + '80',
    borderRadius: LAYOUT.radius.sm,
    marginBottom: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rankContainer: {
    width: 28,
    alignItems: 'center',
    marginRight: LAYOUT.spacing.sm,
  },
  rank: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  habitInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: LAYOUT.spacing.sm,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    ...LAYOUT.typography.body,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  habitStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionsText: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
  },
  separator: {
    ...LAYOUT.typography.small,
    color: COLORS.textMuted,
    marginHorizontal: LAYOUT.spacing.xs,
  },
  streakText: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
  },
  bestStreakText: {
    ...LAYOUT.typography.small,
    color: COLORS.textMuted,
  },
  performanceContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xs,
    gap: 2,
  },
  trendText: {
    ...LAYOUT.typography.small,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'flex-end',
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
  rateContainer: {
    alignItems: 'flex-end',
  },
  percentage: {
    ...LAYOUT.typography.caption,
    fontWeight: '600',
  },
  performanceLevel: {
    ...LAYOUT.typography.small,
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.xl,
  },
  emptyTitle: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textSecondary,
    marginTop: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.xs,
  },
  emptySubtitle: {
    ...LAYOUT.typography.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footer: {
    marginTop: LAYOUT.spacing.lg,
    padding: LAYOUT.spacing.md,
    backgroundColor: COLORS.primary + '10',
    borderRadius: LAYOUT.radius.sm,
  },
  footerText: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
