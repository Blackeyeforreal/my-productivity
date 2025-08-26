import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const quotes = [
  "Keep going!",
  "You are stronger than you think.",
  "One step at a time.",
  "Believe in yourself!",
  "Focus and persist."
];

export default function TimerAnimationScreen() {
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const router = useRouter();
  const params = useGlobalSearchParams();

  const totalSeconds = Number(params.seconds) || 0;
  const timerName = params.name || "Custom Timer";

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const [quote, setQuote] = useState(quotes[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const circleAnim = useRef(new Animated.Value(0)).current; // 0 -> 1 progress

  const radius = 100;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  const startCountdown = () => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          circleAnim.setValue(1);
          return 0;
        }
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        circleAnim.setValue((totalSeconds - prev + 1) / totalSeconds);
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (totalSeconds > 0) {
      startCountdown();
      circleAnim.setValue(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const togglePause = () => {
    if (running) {
      setRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setRunning(true);
      startCountdown();
    }
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    router.back();
  };

  const strokeDashoffset = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, circumference],
  });

  return (
    <View style={styles.container}>
      <View style={styles.haloContainer}>
        <Svg width={radius*2 +strokeWidth} height={radius*2 +strokeWidth}>
          <Circle
            stroke="#222"
            fill="none"
            cx={radius}
            cy={radius}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            stroke="#0ff"
            fill="none"
            cx={radius}
            cy={radius}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${radius}, ${radius}`}
          />
        </Svg>
        <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
      </View>

      <Text style={styles.quote}>{quote}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={togglePause}>
          <Ionicons name={running ? "pause-circle" : "play-circle"} size={64} color="#0ff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={stopTimer}>
          <Ionicons name="stop-circle" size={64} color="#f00" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000' },
  haloContainer: { width: 320, height: 320, justifyContent:'center', alignItems:'center', marginBottom:24 },
  timer: { position:'absolute', fontSize:32, fontWeight:'bold', color:'#0ff' },
  quote: { color:'#fff', fontSize:18, textAlign:'center', marginBottom:32, paddingHorizontal:12 },
  buttonRow: { flexDirection:'row', justifyContent:'space-around', width:'60%' },
});
