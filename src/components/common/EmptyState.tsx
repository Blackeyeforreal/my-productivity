// src/components/common/EmptyState.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={64} color={COLORS.textMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.xxl * 2,
  },
  title: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textSecondary,
    marginTop: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.sm,
  },
  subtitle: {
    ...LAYOUT.typography.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.md,
  },
  actionText: {
    ...LAYOUT.typography.body,
    color: 'white',
    fontWeight: '600',
  },
});
