// src/components/insights/AchievementCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

interface AchievementCardProps {
  achievements: Achievement[];
}

export default function AchievementCard({ achievements }: AchievementCardProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.counter}>
          {unlockedCount}/{achievements.length}
        </Text>
      </View>
      
      <View style={styles.achievementList}>
        {achievements.slice(0, 3).map((achievement) => (
          <View 
            key={achievement.id} 
            style={[
              styles.achievementItem,
              achievement.unlocked && styles.unlockedItem
            ]}
          >
            <View style={[
              styles.iconContainer,
              { 
                backgroundColor: achievement.unlocked 
                  ? achievement.color + '20' 
                  : COLORS.border + '20' 
              }
            ]}>
              <Ionicons 
                name={achievement.icon as any} 
                size={20} 
                color={achievement.unlocked ? achievement.color : COLORS.textMuted} 
              />
            </View>
            
            <View style={styles.achievementContent}>
              <Text style={[
                styles.achievementTitle,
                !achievement.unlocked && styles.lockedText
              ]}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              
              {achievement.progress !== undefined && achievement.target && !achievement.unlocked && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(achievement.progress / achievement.target) * 100}%`,
                          backgroundColor: achievement.color,
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {achievement.progress}/{achievement.target}
                  </Text>
                </View>
              )}
            </View>
            
            {achievement.unlocked && (
              <Ionicons name="checkmark-circle" size={20} color={achievement.color} />
            )}
          </View>
        ))}
      </View>
      
      {achievements.length > 3 && (
        <Text style={styles.moreText}>
          +{achievements.length - 3} more achievements
        </Text>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  title: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
  },
  counter: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: LAYOUT.radius.sm,
  },
  achievementList: {
    gap: LAYOUT.spacing.md,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.spacing.md,
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unlockedItem: {
    borderColor: COLORS.success + '40',
    backgroundColor: COLORS.success + '05',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    ...LAYOUT.typography.body,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  lockedText: {
    color: COLORS.textSecondary,
  },
  achievementDescription: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    marginTop: LAYOUT.spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: LAYOUT.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    ...LAYOUT.typography.small,
    color: COLORS.textSecondary,
  },
  moreText: {
    ...LAYOUT.typography.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: LAYOUT.spacing.lg,
  },
});
