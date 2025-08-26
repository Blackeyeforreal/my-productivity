// src/components/insights/ProgressChart.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface ProgressChartProps {
  data: {
    label: string;
    value: number;
    total: number;
    color: string;
    icon: string;
  }[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress Overview</Text>
      
      <View style={styles.progressList}>
        {data.map((item, index) => {
          const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
          
          return (
            <View key={index} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <View style={styles.progressInfo}>
                  <Ionicons name={item.icon as any} size={16} color={item.color} />
                  <Text style={styles.progressLabel}>{item.label}</Text>
                </View>
                <Text style={styles.progressValue}>
                  {item.value}/{item.total}
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }
                  ]}
                />
              </View>
              
              <Text style={styles.progressPercentage}>
                {Math.round(percentage)}%
              </Text>
            </View>
          );
        })}
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
    marginBottom: LAYOUT.spacing.lg,
  },
  progressList: {
    gap: LAYOUT.spacing.lg,
  },
  progressItem: {
    gap: LAYOUT.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  progressLabel: {
    ...LAYOUT.typography.body,
    color: COLORS.textPrimary,
  },
  progressValue: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
});
