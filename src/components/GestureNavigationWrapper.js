import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

export function GestureNavigationWrapper({ children }) {
  const navigation = useNavigation();
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);

  const swipeGesture = Gesture.Pan()
    .minDistance(10)
    .onStart((event) => {
      // event may expose different properties depending on platform/version
      swipeStartX.current = event.x ?? event.absoluteX ?? 0;
      swipeStartY.current = event.y ?? event.absoluteY ?? 0;
    })
    .onEnd((event) => {
      const endX = event.x ?? event.absoluteX ?? (swipeStartX.current);
      const endY = event.y ?? event.absoluteY ?? (swipeStartY.current);
      const deltaX = endX - swipeStartX.current;
      const deltaY = endY - swipeStartY.current;

      // Only proceed for mostly-horizontal swipes with sufficient distance
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        // Try to get navigation state safely
        const navState = (typeof navigation.getState === 'function')
          ? navigation.getState()
          : (navigation.dangerouslyGetState ? navigation.dangerouslyGetState() : null);
        if (!navState || !Array.isArray(navState.routes)) return;

        const currentRoute = navState.routes[navState.index] || navState.routes[navState.routes.length - 1];
        const currentTabIndex = getTabIndex(currentRoute?.name);
        if (currentTabIndex < 0) return;

        if (deltaX > 0) {
          // Swipe right - go to previous tab
          navigateToTab(currentTabIndex - 1);
        } else {
          // Swipe left - go to next tab
          navigateToTab(currentTabIndex + 1);
        }
      }
    });

  const getTabIndex = (routeName) => {
    const tabs = ['Monitoring', 'Difference', 'Control', 'Profile'];
    return tabs.indexOf(routeName);
  };

  const navigateToTab = (targetIndex) => {
    const tabs = ['Monitoring', 'Difference', 'Control', 'Profile'];
    
    if (targetIndex >= 0 && targetIndex < tabs.length) {
      navigation.navigate(tabs[targetIndex]);
    }
  };

  return (
    <GestureDetector gesture={swipeGesture}>
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