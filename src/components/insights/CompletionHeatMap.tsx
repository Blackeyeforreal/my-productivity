// src/components/insights/CompletionHeatmap.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useHabits } from '../../../context/HabitContext';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface CompletionHeatmapProps {
  timeRange: string;
}

export default function CompletionHeatmap({ timeRange }: CompletionHeatmapProps) {
  const { habits } = useHabits();

  const getHeatmapData = () => {
    const now = new Date();
    const weeks = 12; // Show last 12 weeks
    const heatmapData = [];

    for (let week = weeks - 1; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (week * 7) - (6 - day));
        const dateStr = date.toISOString().split('T')[0];
        
        const completions = habits.reduce((sum, habit) => 
          sum + (habit.completedDates.includes(dateStr) ? 1 : 0), 0
        );
        
        const totalHabits = habits.filter(h => h.isActive).length;
        const intensity = totalHabits > 0 ? completions / totalHabits : 0;
        
        weekData.push({
          date: dateStr,
          intensity,
          completions,
          day: date.getDay(),
        });
      }
      heatmapData.push(weekData);
    }

    return heatmapData;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return COLORS.border;
    if (intensity <= 0.25) return COLORS.primary + '40';
    if (intensity <= 0.5) return COLORS.primary + '60';
    if (intensity <= 0.75) return COLORS.primary + '80';
    return COLORS.primary;
  };

  const data = getHeatmapData();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completion Heatmap</Text>
      <Text style={styles.subtitle}>Last 12 weeks activity</Text>
      
      <View style={styles.heatmapContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {dayLabels.map((day, index) => (
            <Text key={index} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>
        
        {/* Heatmap grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.heatmap}>
            {data.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.week}>
                {week.map((day, dayIndex) => (
                  <View
                    key={dayIndex}
                    style={[
                      styles.day,
                      { backgroundColor: getIntensityColor(day.intensity) }
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
        
        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendText}>Less</Text>
          <View style={styles.legendColors}>
            {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => (
              <View
                key={index}
                style={[
                  styles.legendSquare,
                  { backgroundColor: getIntensityColor(intensity) }
                ]}
              />
            ))}
          </View>
          <Text style={styles.legendText}>More</Text>
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
  heatmapContainer: {
    alignItems: 'center',
  },
  dayLabels: {
    alignSelf: 'flex-start',
    marginBottom: LAYOUT.spacing.sm,
  },
  dayLabel: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
    height: 12,
    lineHeight: 12,
    marginBottom: 2,
  },
  heatmap: {
    flexDirection: 'row',
    gap: 2,
  },
  week: {
    gap: 2,
  },
  day: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: LAYOUT.spacing.lg,
    gap: LAYOUT.spacing.sm,
  },
  legendText: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
  },
  legendColors: {
    flexDirection: 'row',
    gap: 2,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});
