import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
} from 'react-native';

const ITEM_HEIGHT = 30; // height of each row
const VISIBLE_ITEMS = 3; // number of visible items at a time

type PickerProps = {
  data: number[];
  selected: number;
  onSelect: (v: number) => void;
  label: string;
};

export const Picker = ({ data, selected, onSelect, label }: PickerProps) => {
  const scrollRef = useRef<ScrollView>(null);
const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {

    const yOffset = e.nativeEvent.contentOffset.y;
   
    const closestIndex = Math.round(yOffset / ITEM_HEIGHT) ;
    const clampedIndex = Math.max(0, Math.min(closestIndex, data.length - 1));

    if (data[clampedIndex] !== selected) {
      onSelect(data[clampedIndex]);
    }

};


  // Scroll to selected value initially
  useEffect(() => {
    const initialIndex = data.indexOf(selected);
    if (initialIndex !== -1) {
      scrollRef.current?.scrollTo({
        y: initialIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selected]);

  // Calculate selected index on scroll end
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    console.log(e.nativeEvent.contentOffset.y);
    const yOffset = e.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset+ITEM_HEIGHT -1 / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    onSelect(data[clampedIndex]);

    // Snap exactly to item
    scrollRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
  };

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>

      {/* Highlighted center area */}
      
<ScrollView
  ref={scrollRef}
  style={styles.pickerScroll}
  contentContainerStyle={{
    paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
  }}
//  snapToInterval={ITEM_HEIGHT}
  decelerationRate="fast"
  showsVerticalScrollIndicator={false}
  scrollEventThrottle={16}
  onScroll={handleScroll} // live update as you scroll
>

        {data.map((num) => (
          <View
            key={num}
            style={{
              height: ITEM_HEIGHT,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={[
                styles.pickerItem,
                selected === num && styles.pickerItemSelected,
              ]}
            >
              {num.toString().padStart(2, '0')}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    alignItems: 'center',
    width: 80,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pickerScroll: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: '100%',
  },
  pickerItem: {
    fontSize: 20,
    color: '#888',
  },
  pickerItemSelected: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 24,
  },
  centerIndicator: {
    position: 'absolute',
    top: (ITEM_HEIGHT * (VISIBLE_ITEMS - 2)) / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#007AFF',
    zIndex: 1,
  },
});
