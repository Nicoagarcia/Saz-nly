import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootTabParamList } from "../types";
import { RecetasStack } from "./RecetasStack";
import { CategoriasStack } from "./CategoriasStack";
import { GuardadoStack } from "./GuardadoStack";
import { COLORS } from "../constants/colors";

const Tab = createBottomTabNavigator<RootTabParamList>();

function getTabBarVisibility(route: any) {
  const routeName = getFocusedRouteNameFromRoute(route);

  // Hide tab bar on these screens
  if (routeName === "RecipeDetails" || routeName === "Cooking") {
    return { display: "none" } as const;
  }

  return {
    backgroundColor: COLORS.background,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  };
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="RecetasTab"
        component={RecetasStack}
        options={({ route }) => ({
          tabBarLabel: "Recetas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
          tabBarStyle: getTabBarVisibility(route),
        })}
      />
      <Tab.Screen
        name="CategoriasTab"
        component={CategoriasStack}
        options={({ route }) => ({
          tabBarLabel: "Categorías",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          tabBarStyle: getTabBarVisibility(route),
        })}
      />
      <Tab.Screen
        name="GuardadoTab"
        component={GuardadoStack}
        options={({ route }) => ({
          tabBarLabel: "Guardado",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
          tabBarStyle: getTabBarVisibility(route),
        })}
      />
    </Tab.Navigator>
  );
}
