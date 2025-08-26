// context/HabitContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, UserSettings, CompletionRecord } from '../types';
import { HABIT_COLORS } from '../constants/colors';

interface HabitContextType {
  habits: Habit[];
  settings: UserSettings;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longestStreak' | 'completedDates' | 'completionData'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date?: string, value?: number) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  getHabitsForDate: (date: string) => Habit[];
  getTodaysProgress: () => { completed: number; total: number; percentage: number };
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within HabitProvider');
  }
  return context;
};

const defaultSettings: UserSettings = {
  theme: 'dark',
  notifications: true,
  hapticFeedback: true,
  weekStartsOn: 1,
};

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsData, settingsData] = await Promise.all([
        AsyncStorage.getItem('habits'),
        AsyncStorage.getItem('settings'),
      ]);
      
      if (habitsData) setHabits(JSON.parse(habitsData));
      if (settingsData) setSettings({ ...defaultSettings, ...JSON.parse(settingsData) });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    try {
      setHabits(newHabits);
      await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longestStreak' | 'completedDates' | 'completionData'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      completionData: {},
    };
    
    const updatedHabits = [...habits, newHabit];
    saveHabits(updatedHabits);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    const updatedHabits = habits.map(habit =>
      habit.id === id ? { ...habit, ...updates } : habit
    );
    saveHabits(updatedHabits);
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== id);
    saveHabits(updatedHabits);
  };

  const calculateStreak = (completionData: { [date: string]: CompletionRecord }): number => {
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const completion = completionData[dateStr];
      
      if (completion && completion.completed) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const toggleHabitCompletion = (habitId: string, date?: string, value?: number) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const currentCompletion = habit.completionData[targetDate];
        const isCurrentlyCompleted = currentCompletion?.completed || false;
        
        const newCompletionData = {
          ...habit.completionData,
          [targetDate]: {
            completed: !isCurrentlyCompleted,
            value: value,
            completedAt: new Date().toISOString(),
          }
        };

        const completedDates = Object.keys(newCompletionData)
          .filter(date => newCompletionData[date].completed)
          .sort();

        const newStreak = calculateStreak(newCompletionData);
        const longestStreak = Math.max(habit.longestStreak, newStreak);

        return {
          ...habit,
          completionData: newCompletionData,
          completedDates,
          streak: newStreak,
          longestStreak,
        };
      }
      return habit;
    });

    saveHabits(updatedHabits);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const getHabitsForDate = (date: string) => {
    return habits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      
      if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
        const dayOfWeek = new Date(date).getDay();
        return habit.weekdays?.includes(dayOfWeek) || false;
      }
      
      return true;
    });
  };

  const getTodaysProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysHabits = getHabitsForDate(today);
    const completed = todaysHabits.filter(habit => 
      habit.completionData[today]?.completed
    ).length;
    
    return {
      completed,
      total: todaysHabits.length,
      percentage: todaysHabits.length > 0 ? Math.round((completed / todaysHabits.length) * 100) : 0,
    };
  };

  return (
    <HabitContext.Provider value={{
      habits,
      settings,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabitCompletion,
      updateSettings,
      getHabitsForDate,
      getTodaysProgress,
    }}>
      {children}
    </HabitContext.Provider>
  );
};
