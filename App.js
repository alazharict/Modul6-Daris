import React, { useRef, useState, useEffect } from "react";
import { NavigationContainer, DefaultTheme, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import Screens
import MonitoringScreen from "./src/screens/MonitoringScreen.js";
import ControlScreen from "./src/screens/ControlScreen.js";
import DifferenceScreen from "./src/screens/DifferenceScreen.js";
import LoginScreen from "./src/screens/LoginScreen.js";
import SignUpScreen from "./src/screens/SignUpScreen.js";
import ProfileScreen from "./src/screens/ProfileScreen.js";
import SplashScreen from "./src/screens/SplashScreen.js";

// Import Services & Utils
import { assertConfig } from "./src/services/config.js";
import { isAuthenticated } from "./src/utils/storage.js";
import { SwipeTabNavigator } from "./src/components/SwipeTabNavigator.js";

// --- 1. TAMBAHKAN IMPORT INI ---
import { subscribeAuth } from "./src/utils/authEvents"; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

enableScreens(true);

function MainTabs() {
  const navigation = useNavigation();
  const currentTabName = useRef("Monitoring");
  const tabNames = ["Monitoring", "Difference", "Control", "Profile"];
  
  const handleSwipe = (direction) => {
    const currentIdx = tabNames.indexOf(currentTabName.current);
    let nextIdx = currentIdx;
    
    if (direction === "right") {
      nextIdx = currentIdx - 1;
    } else {
      nextIdx = currentIdx + 1;
    }
   
    if (nextIdx >= 0 && nextIdx < tabNames.length) {
      const nextTab = tabNames[nextIdx];
      console.log("[App] Swiping from", currentTabName.current, "to", nextTab);
      
      navigation.navigate('MainTabs', { screen: nextTab });
      currentTabName.current = nextTab;
    }
  };

  return (
    <SwipeTabNavigator onSwipe={handleSwipe}>
      <Tab.Navigator
        screenListeners={({ route }) => ({
          state: (e) => {
            const index = e.data.state.index;
            const routeName = e.data.state.routeNames[index];
            currentTabName.current = routeName;
          },
        })}
        screenOptions={({ route }) => ({
          headerShown: true,
          headerTitle: "IOTWatch",
          headerTitleAlign: "center",
          headerTintColor: "#1f2937",
          headerStyle: { backgroundColor: "#f8f9fb" },
          headerTitleStyle: { fontWeight: "600", fontSize: 18 },
          tabBarActiveTintColor: "#2563eb",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarIcon: ({ color, size }) => {
            let iconName = "analytics";
            if (route.name === "Monitoring") iconName = "analytics";
            else if (route.name === "Difference") iconName = "thermometer";
            else if (route.name === "Control") iconName = "options";
            else if (route.name === "Profile") iconName = "person";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Monitoring" component={MonitoringScreen} />
        <Tab.Screen name="Difference" component={DifferenceScreen} />
        <Tab.Screen name="Control" component={ControlScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SwipeTabNavigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    assertConfig();

    // --- 2. TAMBAHKAN LISTENER DISINI ---
    // Ini akan mendengarkan sinyal dari LoginScreen (true) atau ControlScreen (false)
    const unsubscribe = subscribeAuth((status) => {
      setIsLoggedIn(status);
    });

    // Bersihkan listener saat aplikasi ditutup/unmount
    return () => {
      unsubscribe();
    };
    // -------------------------------------

  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsLoggedIn(false);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f8f9fb",
    },
  };

  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}