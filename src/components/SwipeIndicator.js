import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function SwipeIndicator() {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-50))[0];

  useEffect(() => {
    let timeoutId;

    const showIndicator = () => {
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutId = setTimeout(() => {
        hideIndicator();
      }, 2000);
    };

    const hideIndicator = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    };

    // Show indicator on first app launch
    const timer = setTimeout(() => {
      showIndicator();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutId);
    };
  }, [fadeAnim, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.indicator}>
        <Text style={styles.text}>Swipe kiri/kanan untuk berpindah halaman</Text>
        <View style={styles.arrows}>
          <Text style={styles.arrow}>←</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  indicator: {
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  arrows: {
    flexDirection: 'row',
    gap: 8,
  },
  arrow: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});