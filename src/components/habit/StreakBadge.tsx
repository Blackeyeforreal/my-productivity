// src/components/habit/StreakBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.fire}>🔥</Text>
      <Text style={styles.number}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: LAYOUT.radius.md,
  },
  fire: {
    fontSize: 12,
    marginRight: 2,
  },
  number: {
    ...LAYOUT.typography.caption,
    color: COLORS.warning,
    fontWeight: '600',
  },
});
