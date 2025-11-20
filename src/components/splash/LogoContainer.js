import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function LogoContainer() {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <View style={styles.logoContainer}>
          {/* Ganti dengan logo Anda */}
          <View style={styles.logoPlaceholder}>
            <Image 
              source={require('../../../assets/logo.png')} // Sesuaikan path
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Decorative Particles */}
        <View style={styles.particle1} />
        <View style={styles.particle2} />
        <View style={styles.particle3} />
        <View style={styles.particle4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  particle1: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  particle2: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 6,
    height: 6,
    backgroundColor: '#86efac',
    borderRadius: 3,
  },
  particle3: {
    position: 'absolute',
    top: '25%',
    right: -8,
    width: 4,
    height: 4,
    backgroundColor: '#a3e635',
    borderRadius: 2,
  },
  particle4: {
    position: 'absolute',
    bottom: '25%',
    left: -8,
    width: 3,
    height: 3,
    backgroundColor: '#22c55e',
    borderRadius: 1.5,
  },
});