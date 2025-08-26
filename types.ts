// types.ts
export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  goalType: 'check' | 'count' | 'duration';
  targetValue?: number; // ✅ Make it optional with ?
  targetUnit?: string; // 'reps', 'minutes', 'hours'
  frequency: 'daily' | 'weekly' | 'custom';
  weekdays?: number[]; // [0,1,2,3,4,5,6] for custom frequency
  reminders: Reminder[];
  category: 'morning' | 'afternoon' | 'evening' | 'anytime';
  streak: number;
  longestStreak: number;
  completedDates: string[];
  completionData: { [date: string]: CompletionRecord };
  createdAt: string;
  isActive: boolean;
  notes?: string;
}

export interface Reminder {
  id: string;
  time: string; // HH:MM format
  enabled: boolean;
}

export interface CompletionRecord {
  completed: boolean;
  value?: number; // For count/duration tracking
  completedAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  hapticFeedback: boolean;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}
