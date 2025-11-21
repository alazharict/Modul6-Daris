import { useRef, useCallback, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const TAB_ROUTES = ['Monitoring', 'Difference', 'Control', 'Profile'];

export function useGestureSwipe() {
  const navigation = useNavigation();
  const startX = useRef(0);
  const startY = useRef(0);

  const getTabIndex = useCallback((routeName) => {
    return TAB_ROUTES.indexOf(routeName);
  }, []);

  const navigateToTab = useCallback((targetIndex) => {
    if (targetIndex >= 0 && targetIndex < TAB_ROUTES.length) {
      navigation.navigate(TAB_ROUTES[targetIndex]);
    }
  }, [navigation]);

  const pan = useMemo(() => {
    return Gesture.Pan()
      .onStart((event) => {
        startX.current = event.x;
        startY.current = event.y;
      })
      .onEnd((event) => {
        const deltaX = event.x - startX.current;
        const deltaY = event.y - startY.current;

        // Hanya proses swipe horizontal signifikan (minimal 50px)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          try {
            const state = navigation.getState();
            if (state && state.routes && state.index !== undefined) {
              const currentRoute = state.routes[state.index];
              const currentTabIndex = getTabIndex(currentRoute.name);

              if (currentTabIndex >= 0) {
                if (deltaX > 0) {
                  // Swipe kanan -> tab sebelumnya
                  navigateToTab(currentTabIndex - 1);
                } else {
                  // Swipe kiri -> tab berikutnya
                  navigateToTab(currentTabIndex + 1);
                }
              }
            }
          } catch (error) {
            console.log('Gesture navigation error:', error);
          }
        }
      });
  }, [getTabIndex, navigateToTab]);

  return pan;
}
