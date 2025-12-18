import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GuardadoStackParamList } from "../types";
import { GuardadoScreen } from "../screens/GuardadoScreen";
import { RecipeDetailsScreen } from "../screens/RecipeDetailsScreen";
import { CookingScreen } from "../screens/CookingScreen";

const Stack = createNativeStackNavigator<GuardadoStackParamList>();

export function GuardadoStack() {
  return (
    <Stack.Navigator
      initialRouteName="GuardadoHome"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="GuardadoHome" component={GuardadoScreen} />
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
