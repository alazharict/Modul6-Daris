import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import BackgroundPattern from '../components/splash/BackgroundPattern';
import FloatingElements from '../components/splash/FloatingElements';
import LogoContainer from '../components/splash/LogoContainer';
import TitleSection from '../components/splash/TitleSection';
import LoadingAnimation from '../components/splash/LoadingAnimation';
import Footer from '../components/splash/Footer';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [translateYAnim] = useState(new Animated.Value(8));

  useEffect(() => {
    // Fade in animation
    setTimeout(() => {
      setFadeIn(true);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    // Progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            Animated.parallel([
              Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(translateYAnim, {
                toValue: -8,
                duration: 600,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setIsVisible(false);
              setTimeout(() => {
                if (typeof onComplete === 'function') onComplete();
              }, 100);
            });
          }, 800);
          return 100;
        }
        const nextProgress = prev + 6;
        return nextProgress > 100 ? 100 : nextProgress;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete, scaleAnim, opacityAnim, translateYAnim]);

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ],
        },
      ]}
    >
      <BackgroundPattern fadeOut={fadeOut} />
      <FloatingElements fadeOut={fadeOut} />
      
      <Animated.View style={styles.contentContainer}>
        <LogoContainer />
        <TitleSection fadeIn={fadeIn} />
        <LoadingAnimation fadeIn={fadeIn} progress={progress} />
      </Animated.View>

      <Footer fadeOut={fadeOut} fadeIn={fadeIn} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0fdf4', // Green theme background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
});