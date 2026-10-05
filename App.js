import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AuthScreen from './screens/AuthScreen';
import ForMeScreen from './screens/ForMeScreen';
import ForYouScreen from './screens/ForYouScreen';
import QuantiAiScreen from './screens/QuantiAiScreen';
import ProfileScreen from './screens/ProfileScreen';
import { colors } from './screens/theme';

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

  if (loading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
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
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: colors.tab,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
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
