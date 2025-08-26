import React from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const FIXED_WIDTH = 300;

const items = [
  { label: "Habits", route: "/habits" },
  { label: "Timer", route: "/actTimer" },
  { label: "Reminders", route: "/reminders" },
  { label: "Stats", route: "/stats" },
  { label: "Settings", route: "/settings" },
];

export default function Timer() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.scrollArea}>
        <BlurView intensity={50} style={styles.blurTop} />
        <LinearGradient
          colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
          style={styles.gradientTop}
        />
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
        >
          {items.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.item}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <Text style={styles.text}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <BlurView intensity={50} style={styles.blurBottom} />
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)']}
          style={styles.gradientBottom}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: FIXED_WIDTH,
    overflow: "hidden",
    position: "relative",
    alignSelf: "center",
  },
  container: {
    alignItems: "center",
    paddingTop: ITEM_HEIGHT,
    paddingBottom: ITEM_HEIGHT,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    width: FIXED_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 4,
    elevation: 2,
  },
  text: {
    fontSize: 18,
    marginVertical: 8,
    color: "#333",
    fontWeight: "bold",
  },
  blurTop: {
    width: FIXED_WIDTH,
    position: "absolute",
    top: 0,
    left: "50%",
    transform: [{ translateX: -FIXED_WIDTH / 2 }],
    height: ITEM_HEIGHT,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  blurBottom: {
    width: FIXED_WIDTH,
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: [{ translateX: -FIXED_WIDTH / 2 }],
    height: ITEM_HEIGHT,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  gradientTop: {
    width: FIXED_WIDTH,
    position: "absolute",
    top: 0,
    left: "50%",
    transform: [{ translateX: -FIXED_WIDTH / 2 }],
    height: ITEM_HEIGHT,
    zIndex: 3,
  },
  gradientBottom: {
    width: FIXED_WIDTH,
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: [{ translateX: -FIXED_WIDTH / 2 }],
    height: ITEM_HEIGHT,
    zIndex: 3,
  },
});