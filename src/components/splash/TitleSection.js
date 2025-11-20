import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TitleSection({ fadeIn }) {
  return (
    <View style={styles.container}>
      <Text style={[
        styles.title1,
        !fadeIn && styles.hidden
      ]}>
        IoT
      </Text>
      <Text style={[
        styles.title2,
        !fadeIn && styles.hidden
      ]}>
        Temperature
      </Text>

      <View style={[
        styles.dividerContainer,
        !fadeIn && styles.hiddenScale
      ]}>
        <View style={styles.divider1} />
        <View style={styles.divider2} />
        <View style={styles.divider3} />
      </View>
      
      <Text style={[
        styles.subtitle,
        !fadeIn && styles.hidden
      ]}>
        Temperature Monitoring
      </Text>
      <Text style={[
        styles.tagline,
        !fadeIn && styles.hidden
      ]}>
        Pendeteksi suhu berbasis IoT 
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  title1: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  title2: {
    fontSize: 24,
    fontWeight: '600',
    color: '#16a34a',
    marginTop: -8,
    textAlign: 'center',
  },
  dividerContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  divider1: {
    width: 80,
    height: 2,
    backgroundColor: '#22c55e',
    borderRadius: 1,
    marginBottom: 2,
  },
  divider2: {
    width: 56,
    height: 1,
    backgroundColor: '#4ade80',
    borderRadius: 0.5,
    marginBottom: 2,
    opacity: 0.6,
  },
  divider3: {
    width: 24,
    height: 1,
    backgroundColor: '#86efac',
    borderRadius: 0.5,
    opacity: 0.4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  hidden: {
    opacity: 0,
    transform: [{ translateY: 4 }],
  },
  hiddenScale: {
    opacity: 0,
    transform: [{ scaleX: 0 }],
  },
});