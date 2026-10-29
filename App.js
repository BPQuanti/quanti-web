import { useEffect, useRef, useState } from 'react';
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
import { GeistMono_500Medium, GeistMono_700Bold } from '@expo-google-fonts/geist-mono';
import { Animated, Easing, Modal, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import BootScreen from './components/BootScreen';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import ArcsScreen from './screens/ArcsScreen';
import SignalVaultScreen from './screens/SignalVaultScreen';
import PermissionsGate from './src/components/PermissionsGate';
import OnboardingGate from './src/components/onboarding/OnboardingGate';
import { checkAllPermissions } from './src/services/permissions';
import { colors, fonts } from './screens/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.white,
    border: colors.border,
    primary: colors.tabActive,
  },
};

function MainTabs() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        initialRouteName="Today"
        backBehavior="history"
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
          name="Today"
          component={DashboardScreen}
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => <Ionicons name="sunny" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Arcs"
          component={ArcsScreen}
          options={{
            title: 'Destination',
            tabBarAccessibilityLabel: 'Destination',
            tabBarIcon: ({ color, size }) => <Ionicons name="layers" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="SignalVault"
          component={SignalVaultScreen}
          options={{
            title: 'Privacy',
            tabBarAccessibilityLabel: 'Privacy',
            tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function Reveal({ token, children }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [token, opacity]);

  return <Animated.View style={[styles.reveal, { opacity }]}>{children}</Animated.View>;
}

function PermissionHandshake({ children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkAllPermissions()
      .then((status) => {
        if (!mounted) {
          return;
        }
        const pending = ['healthkit', 'microphone'].some(
          (key) => status[key]?.state === 'pending'
        );
        setOpen(pending);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={handshakeStyles.fill}>
      {children}
      <Modal animationType="fade" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <View style={handshakeStyles.overlay}>
          <PermissionsGate onDone={() => setOpen(false)} />
        </View>
      </Modal>
    </View>
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
    GeistMono_700Bold,
  });
  const signedIn = Boolean(user || isDevBypass);

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return <BootScreen />;
  }

  return (
    <Reveal token={signedIn ? 'app' : 'auth'}>
      {signedIn ? (
        <OnboardingGate>
          <PermissionHandshake>
            <MainTabs />
          </PermissionHandshake>
        </OnboardingGate>
      ) : (
        <AuthScreen />
      )}
    </Reveal>
  );
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
  reveal: { flex: 1 },
  tabBar: {
    backgroundColor: colors.bg,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    elevation: 0,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
    shadowColor: 'transparent',
    shadowOpacity: 0,
  },
  tabLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    fontWeight: '600',
  },
});

const handshakeStyles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: {
    backgroundColor: 'rgba(9, 9, 11, 0.88)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
