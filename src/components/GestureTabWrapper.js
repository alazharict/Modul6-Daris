import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useGestureSwipe } from '../hooks/useGestureSwipe';

export function GestureTabWrapper({ children }) {
  const pan = useGestureSwipe();

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container}>
        {children}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
