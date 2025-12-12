import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./src/types";
import { SearchScreen } from "./src/screens/SearchScreen";
import { RecipeDetailsScreen } from "./src/screens/RecipeDetailsScreen";
import { CookingScreen } from "./src/screens/CookingScreen";
import {
  initDatabase,
  getAllRecipes,
  initializeCategories,
} from "./src/services/database";
import { seedDatabase } from "./src/services/seed";
import { seedNutritionData, seedUnitConversions } from "./src/services/nutritionDatabase";
import { loadUSDALocalData } from "./src/utils/usdaLocalJson";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log("📱 Iniciando aplicación Saz-nly...");

      // Inicializar base de datos
      initDatabase();
      console.log("Base de datos inicializada");

      // Inicializar categorías
      initializeCategories();
      console.log("Categorías inicializadas");

      // Inicializar datos nutricionales
      seedNutritionData();
      seedUnitConversions();
      console.log("Datos nutricionales inicializados");

      // Precargar JSON de USDA en memoria (340 alimentos)
      loadUSDALocalData();
      console.log("JSON de USDA cargado en memoria");

      // TEMPORAL: Forzar seed para recrear todas las recetas
      // Comentar estas 2 líneas después de la primera ejecución
      console.log("Forzando seed para recrear base de datos...");
      seedDatabase();

      setIsReady(true);
    } catch (err) {
      console.error("Error al inicializar app:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Error al iniciar</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Iniciando Saz-nly...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Search"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
        <Stack.Screen
          name="Cooking"
          component={CookingScreen}
          options={{
            gestureEnabled: false, // Prevenir que salgan accidentalmente
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
