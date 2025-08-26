import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert,
  ScrollView,
  Dimensions 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from 'react-native-calendars';

interface Habit {
  id: string;
  name: string;
  streak: number;
  doneToday: boolean;
  completedDates: string[];
  createdAt: string;
  color: string;
}

const HABIT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
];

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
    checkAndResetDay();
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      checkAndResetDay();
    }
  }, [habits.length]);

  const loadHabits = async () => {
    try {
      const saved = await AsyncStorage.getItem("habits");
      if (saved) {
        const loadedHabits = JSON.parse(saved);
        const migratedHabits = loadedHabits.map((habit: any, index: number) => ({
          ...habit,
          completedDates: habit.completedDates || habit.date || [],
          color: habit.color || HABIT_COLORS[index % HABIT_COLORS.length]
        }));
        setHabits(migratedHabits);
      }
    } catch (error) {
      console.error("Error loading habits:", error);
    }
  };

  const saveHabits = async (updated: Habit[]) => {
    try {
      setHabits(updated);
      await AsyncStorage.setItem("habits", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving habits:", error);
    }
  };

  const checkAndResetDay = async () => {
    try {
      const lastResetDate = await AsyncStorage.getItem("lastResetDate");
      const today = new Date().toISOString().split('T')[0];
      
      if (lastResetDate !== today && habits.length > 0) {
        const updated = habits.map((h) => ({
          ...h,
          doneToday: h.completedDates.includes(today)
        }));
        
        saveHabits(updated);
        await AsyncStorage.setItem("lastResetDate", today);
      }
    } catch (error) {
      console.error("Error checking daily reset:", error);
    }
  };

  const addHabit = () => {
    if (!newHabit.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    if (habits.some(h => h.name.toLowerCase() === newHabit.trim().toLowerCase())) {
      Alert.alert("Error", "This habit already exists");
      return;
    }

    const habit: Habit = {
      id: `${Date.now()}-${Math.random()}`,
      name: newHabit.trim(),
      streak: 0,
      doneToday: false,
      completedDates: [],
      createdAt: new Date().toISOString(),
      color: HABIT_COLORS[habits.length % HABIT_COLORS.length]
    };
    
    const updated = [...habits, habit];
    saveHabits(updated);
    setNewHabit("");
  };

  const toggleHabitForDate = (habitId: string, date: string) => {
    const updated = habits.map((habit) => {
      if (habit.id === habitId) {
        const dateIndex = habit.completedDates.indexOf(date);
        let newCompletedDates: string[];
        
        if (dateIndex === -1) {
          newCompletedDates = [...habit.completedDates, date].sort();
        } else {
          newCompletedDates = habit.completedDates.filter(d => d !== date);
        }
        
        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        let checkDate = new Date(today);
        
        while (true) {
          const checkDateStr = checkDate.toISOString().split('T')[0];
          if (newCompletedDates.includes(checkDateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: streak,
          doneToday: newCompletedDates.includes(today)
        };
      }
      return habit;
    });
    
    saveHabits(updated);
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    toggleHabitForDate(id, today);
  };

  const deleteHabit = (id: string) => {
    const habitToDelete = habits.find(h => h.id === id);
    
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habitToDelete?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = habits.filter(habit => habit.id !== id);
            saveHabits(updated);
          }
        }
      ]
    );
  };

  const getMarkedDates = () => {
    if (selectedHabit) {
      const habit = habits.find(h => h.id === selectedHabit);
      if (!habit) return {};
      
      const marked: any = {};
      habit.completedDates.forEach(date => {
        marked[date] = {
          selected: true,
          selectedColor: habit.color,
          textColor: 'white'
        };
      });
      return marked;
    }
    
    const marked: any = {};
    habits.forEach(habit => {
      habit.completedDates.forEach(date => {
        if (!marked[date]) {
          marked[date] = { dots: [] };
        }
        marked[date].dots.push({
          color: habit.color,
          selectedDotColor: habit.color
        });
      });
    });
    
    return marked;
  };

  const getHabitsForDate = (date: string) => {
    return habits.map(habit => ({
      ...habit,
      completedOnDate: habit.completedDates.includes(date)
    }));
  };

  const renderHabit = ({ item }: { item: Habit }) => {
    const completionPercentage = item.completedDates.length > 0 
      ? Math.round((item.completedDates.length / Math.max(1, getDaysSinceCreation(item.createdAt))) * 100)
      : 0;

    return (
      <View style={styles.habitRow}>
        <View style={[styles.habitColorIndicator, { backgroundColor: item.color }]} />
        <View style={styles.habitInfo}>
          <Text style={[styles.habitText, item.doneToday && styles.doneText]}>
            {item.name}
          </Text>
          <Text style={styles.streakText}>
            🔥 {item.streak} • {completionPercentage}% • {item.completedDates.length} total
          </Text>
        </View>
        
        <View style={styles.habitActions}>
          <TouchableOpacity 
            onPress={() => toggleHabit(item.id)}
            style={styles.checkButton}
          >
            <Ionicons
              name={item.doneToday ? "checkmark-circle" : "ellipse-outline"}
              size={32}
              color={item.doneToday ? item.color : "gray"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => deleteHabit(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDateHabits = () => {
    const dateHabits = getHabitsForDate(selectedDate);
    
    return (
      <View style={styles.dateHabitsContainer}>
        <Text style={styles.dateTitle}>
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {dateHabits.map(habit => (
          <TouchableOpacity 
            key={habit.id}
            style={[styles.dateHabitRow, habit.completedOnDate && styles.completedHabitRow]}
            onPress={() => toggleHabitForDate(habit.id, selectedDate)}
          >
            <View style={[styles.habitColorIndicator, { backgroundColor: habit.color }]} />
            <Text style={[styles.dateHabitText, habit.completedOnDate && styles.completedHabitText]}>
              {habit.name}
            </Text>
            <Ionicons
              name={habit.completedOnDate ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={habit.completedOnDate ? habit.color : "gray"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getDaysSinceCreation = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderCalendarView = () => (
    <ScrollView style={styles.calendarContainer}>
      <View style={styles.habitFilterContainer}>
        <Text style={styles.filterTitle}>Filter by habit:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, !selectedHabit && styles.activeFilterButton]}
            onPress={() => setSelectedHabit(null)}
          >
            <Text style={[styles.filterButtonText, !selectedHabit && styles.activeFilterText]}>
              All Habits
            </Text>
          </TouchableOpacity>
          
          {habits.map(habit => (
            <TouchableOpacity
              key={habit.id}
              style={[styles.filterButton, selectedHabit === habit.id && styles.activeFilterButton]}
              onPress={() => setSelectedHabit(habit.id)}
            >
              <View style={[styles.filterColorDot, { backgroundColor: habit.color }]} />
              <Text style={[styles.filterButtonText, selectedHabit === habit.id && styles.activeFilterText]}>
                {habit.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ✅ FIXED: Proper markingType handling */}
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...getMarkedDates(),
          [selectedDate]: {
            ...getMarkedDates()[selectedDate],
            selected: true,
            selectedColor: selectedHabit ? 
              habits.find(h => h.id === selectedHabit)?.color || '#0af' : 
              '#0af'
          }
        }}
        // ✅ FIX: Remove dynamic markingType and use conditional rendering instead
        markingType={selectedHabit ? undefined : 'multi-dot' as any}
        theme={{
          backgroundColor: '#111',
          calendarBackground: '#222',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#0af',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#0af',
          dayTextColor: '#d9e1e8',
          textDisabledColor: '#666',
          dotColor: '#0af',
          selectedDotColor: '#ffffff',
          arrowColor: '#0af',
          disabledArrowColor: '#666',
          monthTextColor: '#d9e1e8',
          indicatorColor: '#0af',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
        style={styles.calendar}
      />

      {renderDateHabits()}
    </ScrollView>
  );

  const renderListView = () => (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          Total Habits: {habits.length}
        </Text>
        <Text style={styles.statsText}>
          Completed Today: {habits.filter(h => h.doneToday).length}
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Add new habit..."
          placeholderTextColor="#888"
          value={newHabit}
          onChangeText={setNewHabit}
          style={styles.input}
          maxLength={50}
          onSubmitEditing={addHabit}
        />
        <TouchableOpacity onPress={addHabit} style={styles.addButton}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>Add a habit to get started!</Text>
          </View>
        }
      />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.title}>Habit Tracker</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentView === 'list' && styles.activeTab]}
          onPress={() => setCurrentView('list')}
        >
          <Ionicons name="list-outline" size={20} color={currentView === 'list' ? '#0af' : '#888'} />
          <Text style={[styles.tabText, currentView === 'list' && styles.activeTabText]}>
            Habits
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, currentView === 'calendar' && styles.activeTab]}
          onPress={() => setCurrentView('calendar')}
        >
          <Ionicons name="calendar-outline" size={20} color={currentView === 'calendar' ? '#0af' : '#888'} />
          <Text style={[styles.tabText, currentView === 'calendar' && styles.activeTabText]}>
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {currentView === 'list' ? renderListView() : renderCalendarView()}
    </View>
  );
}

// [Rest of the styles remain the same...]
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 50
  },
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#111"
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "white", 
    textAlign: "center",
    marginBottom: 20 
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 4
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#333'
  },
  tabText: {
    color: '#888',
    marginLeft: 8,
    fontWeight: '500'
  },
  activeTabText: {
    color: '#0af'
  },
  calendarContainer: {
    flex: 1,
    padding: 20
  },
  habitFilterContainer: {
    marginBottom: 20
  },
  filterTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10
  },
  activeFilterButton: {
    backgroundColor: '#0af'
  },
  filterButtonText: {
    color: '#888',
    fontSize: 14
  },
  activeFilterText: {
    color: 'white'
  },
  filterColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6
  },
  calendar: {
    borderRadius: 12,
    marginBottom: 20
  },
  dateHabitsContainer: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20
  },
  dateTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  dateHabitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 8
  },
  completedHabitRow: {
    backgroundColor: '#1a4a3a'
  },
  dateHabitText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 10
  },
  completedHabitText: {
    color: '#4ade80',
    textDecorationLine: 'line-through'
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 10
  },
  statsText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500"
  },
  inputRow: { 
    flexDirection: "row", 
    marginBottom: 15 
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "white",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333"
  },
  addButton: {
    backgroundColor: "#0af",
    marginLeft: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333"
  },
  habitColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 15
  },
  habitInfo: {
    flex: 1,
    marginRight: 15
  },
  habitText: { 
    fontSize: 18, 
    color: "white",
    fontWeight: "500",
    marginBottom: 4 
  },
  streakText: {
    fontSize: 14,
    color: "#888"
  },
  doneText: { 
    textDecorationLine: "line-through", 
    color: "#888" 
  },
  habitActions: {
    flexDirection: "row",
    alignItems: "center"
  },
  checkButton: {
    padding: 5,
    marginRight: 10
  },
  deleteButton: {
    padding: 5
  },
  listContainer: {
    paddingBottom: 20
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60
  },
  emptyText: {
    fontSize: 20,
    color: "#666",
    marginTop: 15,
    fontWeight: "600"
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 5
  }
});
