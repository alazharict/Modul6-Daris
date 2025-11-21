import { useRef } from 'react';
import { PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TAB_ROUTES = ['Monitoring', 'Difference', 'Control', 'Profile'];

export function useSwipeNavigation() {
  const navigation = useNavigation();
  const panResponderRef = useRef(null);

  if (!panResponderRef.current) {
    // use gestureState.dx to decide whether to become responder so we don't
    // block vertical scrolling (ScrollView) or taps.
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        // Start capturing when horizontal movement is detected and greater than vertical
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderGrant: () => {
        // nothing to do on grant
      },
      onPanResponderMove: () => {
        // no-op; we only act on release
      },
      onPanResponderRelease: (evt, gestureState) => {
        const dx = gestureState.dx;
        // Threshold: minimal 50px horizontal swipe
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(gestureState.dy)) {
          try {
            const state = navigation.getState();
            if (state && state.routes && state.index !== undefined) {
              const currentRoute = state.routes[state.index];
              const currentTabIndex = TAB_ROUTES.indexOf(currentRoute.name);

              if (currentTabIndex >= 0) {
                let nextIndex = currentTabIndex;
                // dx > 0 : finger moved right => previous tab
                if (dx > 0) nextIndex = currentTabIndex - 1;
                else nextIndex = currentTabIndex + 1;

                if (nextIndex >= 0 && nextIndex < TAB_ROUTES.length) {
                  navigation.navigate(TAB_ROUTES[nextIndex]);
                }
              }
            }
          } catch (error) {
            console.log('Swipe navigation error:', error);
          }
        }
      },
    });
  }

  return panResponderRef.current.panHandlers;
}
