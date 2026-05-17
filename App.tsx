import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from './app/screens/HomeScreen';
import { BusinessesScreen } from './app/screens/BusinessesScreen';
import { BusinessDetailScreen } from './app/screens/BusinessDetailScreen';
import { PeopleScreen } from './app/screens/PeopleScreen';
import { ContactDetailScreen } from './app/screens/ContactDetailScreen';
import { JournalScreen } from './app/screens/JournalScreen';
import { GrowthScreen } from './app/screens/GrowthScreen';
import { OnboardingScreen } from './app/screens/OnboardingScreen';
import { useAppStore } from './app/stores/useAppStore';
import { Colors } from './app/utils/colors';

export type RootStackParamList = {
  MainTabs: undefined;
  BusinessDetail: { businessId: string };
  ContactDetail: { contactId: string };
};

type TabParamList = {
  Home: undefined;
  Businesses: undefined;
  People: undefined;
  Journal: undefined;
  Growth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, [string, string]> = {
  Home: ['home', 'home-outline'],
  Businesses: ['briefcase', 'briefcase-outline'],
  People: ['people', 'people-outline'],
  Journal: ['book', 'book-outline'],
  Growth: ['trending-up', 'trending-up-outline'],
};

const TAB_COLORS: Record<string, string> = {
  Home: Colors.primaryGold,
  Businesses: Colors.deepNavy,
  People: Colors.coral,
  Journal: Colors.teal,
  Growth: Colors.purple,
};

function TabBar({ state, descriptors, navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? Colors.darkSurface : Colors.white;
  const borderColor = isDark ? Colors.darkBorder : Colors.grayLight;

  return (
    <View style={[styles.tabBar, { backgroundColor: bg, borderTopColor: borderColor }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = route.name;
        const isFocused = state.index === index;
        const activeColor = TAB_COLORS[route.name];
        const icons = TAB_ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            {isFocused && (
              <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
            )}
            <Ionicons
              name={(isFocused ? icons[0] : icons[1]) as any}
              size={22}
              color={isFocused ? activeColor : isDark ? Colors.darkSubtext : Colors.gray}
            />
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? activeColor : isDark ? Colors.darkSubtext : Colors.gray },
              isFocused && styles.tabLabelActive,
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Businesses" component={BusinessesScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Growth" component={GrowthScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { hasOnboarded, setHasOnboarded } = useAppStore();

  if (!hasOnboarded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OnboardingScreen onDone={() => setHasOnboarded(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
          <Stack.Screen name="ContactDetail" component={ContactDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
    paddingTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
