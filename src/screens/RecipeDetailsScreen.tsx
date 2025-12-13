import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { getRecipeById, toggleFavorite } from "../services/database";
import {
  Recipe,
  RootStackParamList,
  Difficulty,
  RecipeNutrition,
} from "../types";
import { NutritionModal } from "../components/modals/NutritionModal";
import { calculateRecipeNutrition } from "../utils/nutritionCalculator";

type RecipeDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RecipeDetails"
>;
type RecipeDetailsRouteProp = RouteProp<RootStackParamList, "RecipeDetails">;

interface Props {
  navigation: RecipeDetailsNavigationProp;
  route: RecipeDetailsRouteProp;
}

export const RecipeDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [nutritionData, setNutritionData] = useState<RecipeNutrition | null>(
    null
  );
  const [isCalculatingNutrition, setIsCalculatingNutrition] = useState(false);
  const [selectedServings, setSelectedServings] = useState<number>(1);
  const [showServingsModal, setShowServingsModal] = useState(false);
  const { recipeId } = route.params;

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  useEffect(() => {
    if (recipe) {
      setSelectedServings(recipe.servings);
    }
  }, [recipe]);

  const loadRecipe = () => {
    const loadedRecipe = getRecipeById(recipeId);
    setRecipe(loadedRecipe);
  };

  const handleToggleFavorite = () => {
    if (recipe) {
      const newStatus = toggleFavorite(recipe.id);
      setRecipe({ ...recipe, isFavorite: newStatus });
    }
  };

  const handleStartCooking = () => {
    if (recipe) {
      // Crear una copia de la receta con las porciones ajustadas
      const adjustedRecipe = {
        ...recipe,
        servings: selectedServings,
        ingredients: recipe.ingredients.map(ing => ({
          ...ing,
          amount: adjustIngredientAmount(ing.amount)
        }))
      };
      navigation.navigate("Cooking", { recipe: adjustedRecipe });
    }
  };

  const handleNutritionPress = async () => {
    if (recipe) {
      try {
        setIsCalculatingNutrition(true);
        // Crear una copia de la receta con las porciones ajustadas
        const adjustedRecipe = {
          ...recipe,
          servings: selectedServings,
          ingredients: recipe.ingredients.map(ing => ({
            ...ing,
            amount: adjustIngredientAmount(ing.amount)
          }))
        };
        const nutrition = await calculateRecipeNutrition(adjustedRecipe);
        setNutritionData(nutrition);
        setShowNutritionModal(true);
      } catch (error) {
        console.error("Error al calcular nutrición:", error);
      } finally {
        setIsCalculatingNutrition(false);
      }
    }
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return { bg: "#dcfce7", text: "#16a34a" };
      case Difficulty.MEDIUM:
        return { bg: "#fef9c3", text: "#ca8a04" };
      case Difficulty.HARD:
        return { bg: "#fee2e2", text: "#dc2626" };
    }
  };

  const adjustIngredientAmount = (originalAmount: string): string => {
    if (!recipe) return originalAmount;

    const multiplier = selectedServings / recipe.servings;
    if (multiplier === 1) return originalAmount;

    const normalized = originalAmount.toLowerCase().trim();

    // Si es "al gusto", "opcional", etc., no ajustar
    if (/(al?\s*gusto|opcional|algunas?|un\s*poco|c\/n)/i.test(normalized)) {
      return originalAmount;
    }

    // Buscar número y unidad
    const match = normalized.match(/(\d+(?:[.,]\d+)?)\s*(.*)/);
    if (match) {
      const quantity = parseFloat(match[1].replace(',', '.'));
      const unit = match[2].trim();
      const newQuantity = quantity * multiplier;

      // Redondear de forma inteligente
      let displayQuantity: string;
      if (newQuantity < 1) {
        displayQuantity = newQuantity.toFixed(2);
      } else if (newQuantity < 10) {
        displayQuantity = newQuantity.toFixed(1);
      } else {
        displayQuantity = Math.round(newQuantity).toString();
      }

      // Eliminar ceros innecesarios
      displayQuantity = displayQuantity.replace(/\.0+$/, '');

      return `${displayQuantity}${unit ? ' ' + unit : ''}`;
    }

    return originalAmount;
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Receta no encontrada</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const colors = getDifficultyColor(recipe.difficulty);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: recipe.imageUrl || "https://via.placeholder.com/800x400",
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <TouchableOpacity
            style={styles.backButtonFloat}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Text style={styles.favoriteIcon}>
              {recipe.isFavorite ? "⭐" : "☆"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          <View style={styles.metaContainer}>
            <View style={[styles.badge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>
                {recipe.difficulty}
              </Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.metaText}>
                ⏱️ {recipe.prepTimeMinutes} min
              </Text>
            </View>
            <TouchableOpacity
              style={styles.servingsSelector}
              onPress={() => setShowServingsModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.metaText}>
                🍽️ {selectedServings} {selectedServings === 1 ? 'porción' : 'porciones'}
              </Text>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nutritionButton}
              onPress={handleNutritionPress}
              activeOpacity={0.7}
              disabled={isCalculatingNutrition}
            >
              {isCalculatingNutrition ? (
                <ActivityIndicator size="small" color="#f97316" />
              ) : (
                <Text style={styles.nutritionButtonText}>📊</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            {recipe.ingredients.map((ing, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientBullet}>•</Text>
                <View style={styles.ingredientContent}>
                  <Text style={styles.ingredientText}>
                    <Text style={styles.ingredientAmount}>
                      {adjustIngredientAmount(ing.amount)}
                    </Text>{" "}
                    {ing.item}
                  </Text>
                  {ing.notes && (
                    <Text style={styles.ingredientNotes}>{ing.notes}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pasos</Text>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
                {step.timerSeconds && (
                  <View style={styles.timerBadge}>
                    <Text style={styles.timerText}>
                      ⏱️ {Math.floor(step.timerSeconds / 60)} min
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.cookButton}
          onPress={handleStartCooking}
          activeOpacity={0.8}
        >
          <Text style={styles.cookButtonText}>Empezar a Cocinar</Text>
        </TouchableOpacity>
      </View>

      <NutritionModal
        visible={showNutritionModal}
        onClose={() => setShowNutritionModal(false)}
        nutrition={nutritionData}
        recipeTitle={recipe?.title || ""}
      />

      <Modal
        visible={showServingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowServingsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowServingsModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajustar porciones</Text>
            <Text style={styles.modalSubtitle}>
              Receta original: {recipe?.servings} {recipe?.servings === 1 ? 'porción' : 'porciones'}
            </Text>

            <View style={styles.servingsControl}>
              <TouchableOpacity
                style={[
                  styles.servingsButton,
                  selectedServings === 1 && styles.servingsButtonDisabled,
                ]}
                onPress={() =>
                  setSelectedServings(Math.max(1, selectedServings - 1))
                }
                disabled={selectedServings === 1}
              >
                <Text style={styles.servingsButtonText}>−</Text>
              </TouchableOpacity>

              <View style={styles.servingsDisplay}>
                <Text style={styles.servingsNumber}>{selectedServings}</Text>
                <Text style={styles.servingsLabel}>
                  {selectedServings === 1 ? 'porción' : 'porciones'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.servingsButton,
                  selectedServings === 10 && styles.servingsButtonDisabled,
                ]}
                onPress={() =>
                  setSelectedServings(Math.min(10, selectedServings + 1))
                }
                disabled={selectedServings === 10}
              >
                <Text style={styles.servingsButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickServings}>
              {[1, 2, 4, 6, 8, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.quickServingButton,
                    selectedServings === num && styles.quickServingButtonActive,
                  ]}
                  onPress={() => setSelectedServings(num)}
                >
                  <Text
                    style={[
                      styles.quickServingText,
                      selectedServings === num && styles.quickServingTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowServingsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  backButtonFloat: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#1f2937",
  },
  favoriteButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIcon: {
    fontSize: 24,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  ingredientBullet: {
    fontSize: 18,
    color: "#f97316",
    marginRight: 8,
    marginTop: 2,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientText: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 24,
  },
  ingredientAmount: {
    fontWeight: "600",
    color: "#f97316",
  },
  ingredientNotes: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 2,
  },
  stepContainer: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  stepDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  timerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fff7ed",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  timerText: {
    fontSize: 14,
    color: "#f97316",
    fontWeight: "600",
  },
  bottomBar: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cookButton: {
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cookButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#f97316",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  nutritionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff7ed",
    borderWidth: 2,
    borderColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  nutritionButtonText: {
    fontSize: 20,
  },
  servingsSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f97316",
    gap: 6,
  },
  editIcon: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  servingsControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 24,
  },
  servingsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
  },
  servingsButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  servingsButtonText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  servingsDisplay: {
    alignItems: "center",
    minWidth: 100,
  },
  servingsNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#f97316",
  },
  servingsLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  quickServings: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  quickServingButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  quickServingButtonActive: {
    backgroundColor: "#fff7ed",
    borderColor: "#f97316",
  },
  quickServingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  quickServingTextActive: {
    color: "#f97316",
  },
  modalCloseButton: {
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
