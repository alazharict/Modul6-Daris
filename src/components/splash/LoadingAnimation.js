import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LoadingAnimation({ fadeIn, progress }) {
  const progressPercentage = Math.min(progress, 100);

  return (
    <View style={[
      styles.container,
      !fadeIn && styles.hidden
    ]}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progressPercentage}%` }
            ]}
          />
        </View>
        
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {progressPercentage < 100 ? 'Memuat aplikasi...' : 'Siap digunakan!'}
          </Text>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>{progressPercentage}%</Text>
            <View style={[
              styles.statusDot,
              progressPercentage < 100 ? styles.loadingDot : styles.readyDot
            ]} />
          </View>
        </View>
      </View>

      {/* Loading Dots */}
      <View style={styles.dotsContainer}>
        <View style={[
          styles.dot,
          progressPercentage < 100 ? styles.dotLoading1 : styles.dotReady1
        ]} />
        <View style={[
          styles.dot,
          progressPercentage < 100 ? styles.dotLoading2 : styles.dotReady2
        ]} />
        <View style={[
          styles.dot,
          progressPercentage < 100 ? styles.dotLoading3 : styles.dotReady3
        ]} />
        <View style={[
          styles.smallDot,
          progressPercentage < 100 ? styles.dotLoading4 : styles.dotReady4
        ]} />
        <View style={[
          styles.smallDot,
          progressPercentage < 100 ? styles.dotLoading5 : styles.dotReady5
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    maxWidth: 300,
  },
  hidden: {
    opacity: 0,
    transform: [{ translateY: 4 }],
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  progressText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  percentageText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loadingDot: {
    backgroundColor: '#16a34a',
  },
  readyDot: {
    backgroundColor: '#22c55e',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotLoading1: { backgroundColor: '#15803d' },
  dotLoading2: { backgroundColor: '#16a34a' },
  dotLoading3: { backgroundColor: '#22c55e' },
  dotLoading4: { backgroundColor: '#4ade80' },
  dotLoading5: { backgroundColor: '#86efac' },
  dotReady1: { backgroundColor: '#22c55e' },
  dotReady2: { backgroundColor: '#4ade80' },
  dotReady3: { backgroundColor: '#86efac' },
  dotReady4: { backgroundColor: '#bbf7d0' },
  dotReady5: { backgroundColor: '#dcfce7' },
});