// screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../constants/colors';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingData = [
  {
    id: 1,
    title: 'Build Better Habits',
    subtitle: 'Transform your daily routine with simple, trackable habits that stick.',
    icon: 'checkmark-circle',
  },
  {
    id: 2,
    title: 'Track Your Progress',
    subtitle: 'Visualize your journey with streaks, calendars, and insightful analytics.',
    icon: 'analytics',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentData = onboardingData[currentIndex];
  const isLastSlide = currentIndex === onboardingData.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={currentData.icon as any} size={80} color={COLORS.primary} />
        </View>
        
        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.subtitle}>{currentData.subtitle}</Text>
        
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
        
        {!isLastSlide && (
          <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.xl,
  },
  iconContainer: {
    marginBottom: LAYOUT.spacing.xxl,
  },
  title: {
    ...LAYOUT.typography.title,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  subtitle: {
    ...LAYOUT.typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: LAYOUT.spacing.xxl,
  },
  pagination: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
  },
  footer: {
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingBottom: LAYOUT.spacing.xl,
  },
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.md,
    gap: LAYOUT.spacing.sm,
  },
  buttonText: {
    ...LAYOUT.typography.subtitle,
    color: 'white',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.lg,
  },
  skipButtonText: {
    ...LAYOUT.typography.body,
    color: COLORS.textSecondary,
  },
});
