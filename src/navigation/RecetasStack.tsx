import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RecetasStackParamList } from "../types";
import { SearchScreen } from "../screens/SearchScreen";
import { RecipeDetailsScreen } from "../screens/RecipeDetailsScreen";
import { CookingScreen } from "../screens/CookingScreen";

const Stack = createNativeStackNavigator<RecetasStackParamList>();

export function RecetasStack() {
  return (
    <Stack.Navigator
      initialRouteName="RecetasHome"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="RecetasHome" component={SearchScreen} />
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
