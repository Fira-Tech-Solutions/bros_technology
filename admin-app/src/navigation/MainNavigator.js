import React, { Suspense, lazy } from "react";
import { View, Text, ActivityIndicator } from "react-native";
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

const SyndicationConfigScreen = lazy(() => import("../screens/SyndicationConfigScreen"));
const ForgotPasswordScreen = lazy(() => import("../screens/ForgotPasswordScreen"));
const ResetPasswordScreen = lazy(() => import("../screens/ResetPasswordScreen"));
const NotificationScreen = lazy(() => import("../screens/NotificationScreen"));
const CommissionScreen = lazy(() => import("../screens/CommissionScreen"));
const ContactSettingsScreen = lazy(() => import("../screens/ContactSettingsScreen"));
const AgentManagementScreen = lazy(() => import("../screens/AgentManagementScreen"));

function LazyFallback() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="small" />
    </View>
  );
}

function withSuspense(Component) {
  return function WrappedComponent(props) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

const LazySyndicationConfig = withSuspense(SyndicationConfigScreen);
const LazyForgotPassword = withSuspense(ForgotPasswordScreen);
const LazyResetPassword = withSuspense(ResetPasswordScreen);
const LazyNotification = withSuspense(NotificationScreen);
const LazyCommission = withSuspense(CommissionScreen);
const LazyContactSettings = withSuspense(ContactSettingsScreen);
const LazyAgentManagement = withSuspense(AgentManagementScreen);

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
        component={LazyNotification}
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
        component={LazyForgotPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={LazyResetPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactSettings"
        component={LazyContactSettings}
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
          component={LazyCommission}
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
          component={LazyAgentManagement}
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
        component={LazySyndicationConfig}
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
