// src/screens/habits/AddEditHabitScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHabits } from '../../context/HabitContext';
import { COLORS, LAYOUT, HABIT_COLORS } from '../../constants/colors';
import { Habit, Reminder } from '../../types';

const HABIT_ICONS = [
  'water', 'fitness', 'book', 'leaf', 'musical-notes',
  'camera', 'time', 'heart', 'star', 'flash'
];

const GOAL_TYPES = [
  { id: 'check', label: 'Simple Check', icon: 'checkmark-circle' },
  { id: 'count', label: 'Count Goal', icon: 'add-circle' },
  { id: 'duration', label: 'Duration Goal', icon: 'timer' },
];

const CATEGORIES = [
  { id: 'morning', label: 'Morning', icon: 'sunny' },
  { id: 'afternoon', label: 'Afternoon', icon: 'partly-sunny' },
  { id: 'evening', label: 'Evening', icon: 'moon' },
  { id: 'anytime', label: 'Anytime', icon: 'time' },
];

export default function AddEditHabitScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { addHabit, updateHabit, habits } = useHabits();
  
  const habitId = (route.params as any)?.habitId;
  const isEditing = !!habitId;
  const existingHabit = habits.find(h => h.id === habitId);

  const [formData, setFormData] = useState({
    name: '',
    icon: 'checkmark-circle',
    color: HABIT_COLORS[0],
    goalType: 'check' as 'check' | 'count' | 'duration',
    targetValue: 1,
    targetUnit: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    weekdays: [1, 2, 3, 4, 5, 6, 0], // Mon-Sun
    category: 'anytime' as 'morning' | 'afternoon' | 'evening' | 'anytime',
    reminders: [] as Reminder[],
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEditing && existingHabit) {
      setFormData({
        name: existingHabit.name,
        icon: existingHabit.icon,
        color: existingHabit.color,
        goalType: existingHabit.goalType,
        targetValue: existingHabit.targetValue || 1,
        targetUnit: existingHabit.targetUnit || '',
        frequency: existingHabit.frequency,
        weekdays: existingHabit.weekdays || [1, 2, 3, 4, 5, 6, 0],
        category: existingHabit.category,
        reminders: existingHabit.reminders,
        notes: existingHabit.notes || '',
        isActive: existingHabit.isActive,
      });
    }
  }, [isEditing, existingHabit]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (formData.goalType !== 'check' && formData.targetValue <= 0) {
      Alert.alert('Error', 'Please enter a valid target value');
      return;
    }

    const habitData = {
      ...formData,
      name: formData.name.trim(),
      targetUnit: formData.goalType === 'duration' ? 'minutes' : 
                   formData.goalType === 'count' ? formData.targetUnit || 'reps' : 
                   undefined,
    };

    if (isEditing) {
      updateHabit(habitId, habitData);
    } else {
      addHabit(habitData);
    }

    navigation.goBack();
  };

  const renderIconPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Icon</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {HABIT_ICONS.map(icon => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconOption,
              formData.icon === icon && styles.selectedIconOption,
            ]}
            onPress={() => setFormData({ ...formData, icon })}
          >
            <Ionicons 
              name={icon as any} 
              size={24} 
              color={formData.icon === icon ? COLORS.primary : COLORS.textSecondary} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderColorPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Color</Text>
      <View style={styles.colorGrid}>
        {HABIT_COLORS.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              formData.color === color && styles.selectedColorOption,
            ]}
            onPress={() => setFormData({ ...formData, color })}
          >
            {formData.color === color && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGoalTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Goal Type</Text>
      {GOAL_TYPES.map(type => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.optionRow,
            formData.goalType === type.id && styles.selectedOption,
          ]}
          onPress={() => setFormData({ 
            ...formData, 
            goalType: type.id as any,
            targetValue: type.id === 'check' ? 0 : 1,// 0 was undefined 
          })}
        >
          <Ionicons name={type.icon as any} size={20} color={COLORS.textPrimary} />
          <Text style={styles.optionText}>{type.label}</Text>
          {formData.goalType === type.id && (
            <Ionicons name="checkmark" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      ))}
      
      {formData.goalType !== 'check' && (
        <View style={styles.targetInputContainer}>
          <TextInput
            style={styles.targetInput}
            placeholder="Target value"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.targetValue?.toString()}
            onChangeText={(text) => setFormData({ 
              ...formData, 
              targetValue: parseInt(text) || 0 
            })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.unitInput}
            placeholder={formData.goalType === 'duration' ? 'minutes' : 'unit'}
            placeholderTextColor={COLORS.textSecondary}
            value={formData.targetUnit}
            onChangeText={(text) => setFormData({ ...formData, targetUnit: text })}
          />
        </View>
      )}
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryOption,
              formData.category === category.id && styles.selectedCategoryOption,
            ]}
            onPress={() => setFormData({ ...formData, category: category.id as any })}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={formData.category === category.id ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[
              styles.categoryText,
              formData.category === category.id && styles.selectedCategoryText,
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Habit' : 'Add Habit'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habit Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter habit name"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            maxLength={50}
          />
        </View>

        {renderIconPicker()}
        {renderColorPicker()}
        {renderGoalTypeSelector()}
        {renderCategorySelector()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            placeholder="Add notes about your habit"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={3}
          />
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingVertical: LAYOUT.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
  },
  saveButton: {
    ...LAYOUT.typography.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.spacing.xl,
  },
  section: {
    marginVertical: LAYOUT.spacing.lg,
  },
  sectionTitle: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.md,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    color: COLORS.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedIconOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: COLORS.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    marginBottom: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  optionText: {
    ...LAYOUT.typography.body,
    color: COLORS.textPrimary,
    flex: 1,
    marginLeft: LAYOUT.spacing.md,
  },
  targetInputContainer: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    marginTop: LAYOUT.spacing.md,
  },
  targetInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
  },
  categoryOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCategoryOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  categoryText: {
    ...LAYOUT.typography.body,
    color: COLORS.textSecondary,
    marginLeft: LAYOUT.spacing.sm,
  },
  selectedCategoryText: {
    color: COLORS.primary,
  },
});
