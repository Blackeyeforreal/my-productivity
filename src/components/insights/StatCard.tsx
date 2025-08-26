// src/components/insights/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ title, value, icon, color, subtitle, trend }: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'neutral': return 'remove';
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.danger;
      case 'neutral': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { width: '48%' }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        {trend && (
          <Ionicons 
            name={getTrendIcon() as any} 
            size={16} 
            color={getTrendColor()} 
          />
        )}
      </View>
      
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    ...LAYOUT.typography.title,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: LAYOUT.spacing.xs,
  },
  title: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.xs,
  },
  subtitle: {
    ...LAYOUT.typography.small,
    color: COLORS.textMuted,
  },
});