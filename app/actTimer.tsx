import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';


import { Picker } from './Component/picker';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 3;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Smooth picker component
type PickerProps = {
  data: number[];
  selected: number;
  onSelect: (v: number) => void;
  label: string;
};



// Main Timer Component
export default function ActTimer() {
    const navigation = useNavigation();
    const router = useRouter();
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedSecond, setSelectedSecond] = useState(0);
  const [timerName, setTimerName] = useState('');
  const [savedTimers, setSavedTimers] = useState<{ name: string; seconds: number }[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const saveTimer = () => {
    const totalSeconds = selectedHour * 3600 + selectedMinute * 60 + selectedSecond;
    if (!timerName || totalSeconds <= 0) return;
    setSavedTimers([...savedTimers, { name: timerName, seconds: totalSeconds }]);
    setTimerName('');
  };

     const startTimer = () => {
    const totalSeconds = selectedHour * 3600 + selectedMinute * 60 + selectedSecond;
    console.log("Starting timer for", totalSeconds, "seconds");
    if (totalSeconds <= 0) return;

    router.push({
      pathname: '/modules/runningTimer',
      params: { seconds: totalSeconds, name: timerName || 'Custom Timer' },
    }); 
  };


  const pauseTimer = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    pauseTimer();
    setSecondsLeft(0);
    setSelectedHour(0);
    setSelectedMinute(0);
    setSelectedSecond(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.pickerRow}>
        <Picker data={HOURS} selected={selectedHour} onSelect={setSelectedHour} label="Hours" />
        <Picker data={MINUTES} selected={selectedMinute} onSelect={setSelectedMinute} label="Minutes" />
        <Picker data={SECONDS} selected={selectedSecond} onSelect={setSelectedSecond} label="Seconds" />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Timer Name"
        value={timerName}
        onChangeText={setTimerName}
      />

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <Button
          title={running ? "Pause" : "Start"}
          onPress={() => (running ? pauseTimer() : startTimer())}
          disabled={selectedHour === 0 && selectedMinute === 0 && selectedSecond === 0}
        />
        <Button title="Reset" onPress={resetTimer} />
        <Button title="Save Timer" onPress={saveTimer} />
      </View>

      <Text style={styles.heading}>Saved Timers</Text>
      <FlatList
        data={savedTimers}
        keyExtractor={(item, idx) => item.name + idx}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.savedTimer}
            onPress={() => startTimer()}
            disabled={running}
          >
            <Text style={styles.timerName}>{item.name}</Text>
            <Text style={styles.timerTime}>{formatTime(item.seconds)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>No timers saved.</Text>}
      />

      <View style={styles.activeTimerBox}>
        <Text style={styles.activeTimerName}>{timerName || 'Timer'}</Text>
        <Text style={styles.activeTimerTime}>{formatTime(secondsLeft)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  heading: { fontSize: 20, fontWeight: "bold", marginVertical: 12 },
  pickerRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    minWidth: 80,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  savedTimer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginVertical: 4,
    backgroundColor: "#eef",
    borderRadius: 8,
  },
  timerName: { fontSize: 16, fontWeight: "bold" },
  timerTime: { fontSize: 16, color: "#555" },
  activeTimerBox: {
    marginTop: 24,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffe",
    borderRadius: 12,
    elevation: 2,
  },
  activeTimerName: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  activeTimerTime: { fontSize: 36, fontWeight: "bold", marginBottom: 16 },
});
