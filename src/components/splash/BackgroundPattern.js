import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function BackgroundPattern({ fadeOut }) {
  return (
    <View style={[
      styles.container,
      fadeOut && styles.fadeOut
    ]} />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
    opacity: 0.3,
  },
  fadeOut: {
    opacity: 0,
  },
});