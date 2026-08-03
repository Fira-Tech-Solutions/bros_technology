import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LayoutDashboard, Building2, Settings, Send, DollarSign, Users } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

import DashboardScreen from "../screens/DashboardScreen";
import PropertiesScreen from "../screens/PropertiesScreen";
import AddListingScreen from "../screens/AddListingScreen";
import ListingDetailScreen from "../screens/ListingDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SyndicationScreen from "../screens/SyndicationScreen";
import SyndicationConfigScreen from "../screens/SyndicationConfigScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import NotificationScreen from "../screens/NotificationScreen";
import CommissionScreen from "../screens/CommissionScreen";
import ContactSettingsScreen from "../screens/ContactSettingsScreen";
import AgentManagementScreen from "../screens/AgentManagementScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Syndication"
        component={SyndicationScreen}
        options={{ title: "Syndication" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function PropertiesStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
      }}
    >
      <Stack.Screen
        name="PropertiesHome"
        component={PropertiesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddListing"
        component={AddListingScreen}
        options={{ title: "Add Listing" }}
      />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactSettings"
        component={ContactSettingsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function TabIcon({ icon: Icon, color, focused, size }) {
  return (
    <View
      style={{
        width: 48,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? color + "18" : "transparent",
      }}
    >
      <Icon size={size || 20} color={color} strokeWidth={focused ? 2.2 : 1.75} />
    </View>
  );
}

export default function MainNavigator() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const isAdmin = user?.role === "SUPER_ADMIN";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: isDark ? colors.bg : "#FFFFFF",
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: t("dashboard"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={LayoutDashboard} color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Properties"
        component={PropertiesStack}
        options={{
          tabBarLabel: t("properties"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={Building2} color={color} focused={focused} size={size} />
          ),
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Finance"
          component={CommissionScreen}
          options={{
            tabBarLabel: "Finance",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon icon={DollarSign} color={color} focused={focused} size={size} />
            ),
          }}
        />
      )}
      {isAdmin && (
        <Tab.Screen
          name="Agents"
          component={AgentManagementScreen}
          options={{
            tabBarLabel: "Agents",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon icon={Users} color={color} focused={focused} size={size} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Syndication"
        component={SyndicationConfigScreen}
        options={{
          tabBarLabel: "Syndication",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={Send} color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: t("settings"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={Settings} color={color} focused={focused} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
