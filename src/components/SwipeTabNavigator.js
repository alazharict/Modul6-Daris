import React from "react";
import { View, StyleSheet } from "react-native";
import { PanResponder } from "react-native";

const TAB_ROUTES = ["Monitoring", "Difference", "Control", "Profile"];

export function SwipeTabNavigator({ children, onSwipe }) {
  const panResponderRef = React.useRef(null);

  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return false;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const isHorizontal = Math.abs(dx) > Math.abs(dy);
        const isSignificant = Math.abs(dx) > 5;

        const shouldCapture = isHorizontal && isSignificant;

        if (shouldCapture) {
          console.log("[SwipeNav] Captured pan:", { dx, dy, isHorizontal });
        }

        return shouldCapture;
      },
      onPanResponderGrant: () => {
        console.log("[SwipeNav] PanResponder granted");
      },
      onPanResponderMove: (evt, gestureState) => {
        // Optional: debug info saat bergerak
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const isHorizontal = Math.abs(dx) > Math.abs(dy);

        console.log("[SwipeNav] Release:", { dx, dy, isHorizontal });

        // Threshold 40px untuk swipe
        if (isHorizontal && Math.abs(dx) > 40) {
          console.log("[SwipeNav] Swipe detected, calling onSwipe");
          if (onSwipe) {
            const direction = dx > 0 ? "right" : "left";
            onSwipe(direction);
          }
        }
      },
      onPanResponderTerminate: () => {
        console.log("[SwipeNav] Pan terminated");
      },
    });
  }

  return (
    <View
      style={styles.container}
      pointerEvents="box-none"
      {...panResponderRef.current.panHandlers}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
