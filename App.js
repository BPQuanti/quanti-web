import { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import BootScreen from './components/BootScreen';
import AuthScreen from './screens/AuthScreen';
import ForMeScreen from './screens/ForMeScreen';
import ForYouScreen from './screens/ForYouScreen';
import QuantiAiScreen from './screens/QuantiAiScreen';
import ProfileScreen from './screens/ProfileScreen';
import { colors, fonts } from './screens/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.tab,
    text: colors.white,
    border: colors.border,
    primary: colors.tabActive,
  },
};

function TabIcon({ emoji, focused }) {
  return <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{emoji}</Text>;
}

function MainTabs() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        initialRouteName="ForMe"
        screenOptions={{
          headerShown: false,
          unmountOnBlur: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.inactive,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="ForMe"
          component={ForMeScreen}
          options={{
            title: 'For Me',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="ForYou"
          component={ForYouScreen}
          options={{
            title: 'For You',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="QuantiAI"
          component={QuantiAiScreen}
          options={{
            title: 'Quanti AI',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🤖" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function Root() {
  const { user, loading, isDevBypass } = useAuth();
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return <BootScreen />;
  }

  if (!user && !isDevBypass) {
    return <AuthScreen />;
  }

  return <MainTabs />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <StatusBar style="light" />
          <Root />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tab,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 18,
    color: colors.inactive,
    opacity: 1,
  },
  tabIconActive: {
    color: colors.tabActive,
    opacity: 1,
    textShadowColor: colors.glow,
    textShadowRadius: 8,
  },
});
