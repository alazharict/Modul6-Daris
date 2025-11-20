import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Footer({ fadeOut, fadeIn }) {
  return (
    <>
      <View style={[
        styles.footerBackground,
        fadeOut && styles.fadeOut
      ]} />
      
      <View style={[
        styles.footerContent,
        !fadeIn && styles.hidden,
        fadeOut && styles.fadeOut
      ]}>
        <View style={styles.dividerContainer}>
          <View style={styles.divider1} />
          <View style={styles.divider2} />
          <View style={styles.divider3} />
        </View>
        
        <Text style={styles.versionText}>
          By Kelompok 32 
        </Text>
        
        <View style={styles.bottomDivider} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footerBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerContent: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  divider1: {
    width: 20,
    height: 1,
    backgroundColor: '#22c55e',
    borderRadius: 0.5,
  },
  divider2: {
    width: 30,
    height: 1,
    backgroundColor: '#16a34a',
    borderRadius: 0.5,
  },
  divider3: {
    width: 20,
    height: 1,
    backgroundColor: '#15803d',
    borderRadius: 0.5,
  },
  versionText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 6,
  },
  bottomDivider: {
    width: 40,
    height: 1,
    backgroundColor: '#22c55e',
    borderRadius: 0.5,
    opacity: 0.8,
  },
  hidden: {
    opacity: 0,
    transform: [{ translateY: 4 }],
  },
  fadeOut: {
    opacity: 0,
  },
});