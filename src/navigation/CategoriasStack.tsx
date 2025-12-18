import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CategoriasStackParamList } from "../types";
import { CategoriasScreen } from "../screens/CategoriasScreen";
import { RecipeDetailsScreen } from "../screens/RecipeDetailsScreen";
import { CookingScreen } from "../screens/CookingScreen";

const Stack = createNativeStackNavigator<CategoriasStackParamList>();

export function CategoriasStack() {
  return (
    <Stack.Navigator
      initialRouteName="CategoriasHome"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="CategoriasHome" component={CategoriasScreen} />
      <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
      <Stack.Screen
        name="Cooking"
        component={CookingScreen}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
