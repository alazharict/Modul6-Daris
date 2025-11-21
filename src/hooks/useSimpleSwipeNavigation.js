import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

const TAB_ROUTES = ['Monitoring', 'Difference', 'Control', 'Profile'];

export function useSimpleSwipeNavigation() {
  const navigation = useNavigation();
  const lastXRef = useRef(0);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Cleanup
    });
    
    return unsubscribe;
  }, [navigation]);

  // Return a function that can be called from a native gesture handler or view
  const handleSwipe = (deltaX) => {
    if (Math.abs(deltaX) < 50) return; // Threshold

    try {
      const state = navigation.getState();
      if (!state || !state.routes || state.index === undefined) return;

      const currentRoute = state.routes[state.index];
      const currentTabIndex = TAB_ROUTES.indexOf(currentRoute.name);

      if (currentTabIndex < 0) return;

      let nextIndex = currentTabIndex;
      if (deltaX > 0) {
        // Swipe kanan -> tab sebelumnya
        nextIndex = currentTabIndex - 1;
      } else {
        // Swipe kiri -> tab berikutnya
        nextIndex = currentTabIndex + 1;
      }

      if (nextIndex >= 0 && nextIndex < TAB_ROUTES.length) {
        navigation.navigate(TAB_ROUTES[nextIndex]);
      }
    } catch (error) {
      console.log('Swipe error:', error);
    }
  };

  return { handleSwipe, lastXRef };
}
