import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function FloatingElements({ fadeOut }) {
  return (
    <>
      <View style={[
        styles.element1,
        fadeOut && styles.fadeOut
      ]} />
      <View style={[
        styles.element2,
        fadeOut && styles.fadeOut
      ]} />
      <View style={[
        styles.element3,
        fadeOut && styles.fadeOut
      ]} />
      <View style={[
        styles.element4,
        fadeOut && styles.fadeOut
      ]} />
    </>
  );
}

const styles = StyleSheet.create({
  element1: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(134, 239, 172, 0.3)',
    borderRadius: 40,
    opacity: 1,
  },
  element2: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 30,
    opacity: 1,
  },
  element3: {
    position: 'absolute',
    top: '33%',
    right: 15,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(163, 230, 53, 0.2)',
    borderRadius: 20,
    opacity: 1,
  },
  element4: {
    position: 'absolute',
    bottom: '25%',
    left: 15,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(187, 247, 208, 0.4)',
    borderRadius: 25,
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
    transform: [{ translateY: 4 }],
  },
});