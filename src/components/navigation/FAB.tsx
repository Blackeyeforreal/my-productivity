// src/components/navigation/FAB.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface FABProps {
  icon: string;
  onPress: () => void;
}

export default function FAB({ icon, onPress }: FABProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
