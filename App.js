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
import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import BootScreen from './components/BootScreen';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import TrendsScreen from './screens/TrendsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import HubScreen from './screens/HubScreen';
import ForYouScreen from './screens/ForYouScreen';
import ForMeScreen from './screens/ForMeScreen';
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
    card: '#020617',
    text: colors.white,
    border: colors.border,
    primary: colors.tabActive,
  },
};

const hiddenTab = {
  tabBarButton: () => null,
  tabBarItemStyle: { display: 'none', width: 0, maxWidth: 0, height: 0 },
};

function MainTabs() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        initialRouteName="Focus"
        screenOptions={{
          headerShown: false,
          unmountOnBlur: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#818CF8',
          tabBarInactiveTintColor: '#64748B',
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Focus"
          component={DashboardScreen}
          options={{
            title: 'Focus',
            tabBarIcon: ({ color, size }) => <Ionicons name="flash" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Trends"
          component={TrendsScreen}
          options={{
            title: 'Trends',
            tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Momentum"
          component={LeaderboardScreen}
          options={{
            title: 'Momentum',
            tabBarIcon: ({ color, size }) => <Ionicons name="trophy" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Hub"
          component={HubScreen}
          options={{
            title: 'Hub',
            tabBarIcon: ({ color, size }) => <Ionicons name="options" color={color} size={size} />,
          }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} options={hiddenTab} />
        <Tab.Screen name="QuantiAI" component={QuantiAiScreen} options={hiddenTab} />
        <Tab.Screen name="ForYou" component={ForYouScreen} options={hiddenTab} />
        <Tab.Screen name="ForMeLedger" component={ForMeScreen} options={hiddenTab} />
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
    backgroundColor: '#020617',
    borderTopColor: '#1E293B',
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
});
