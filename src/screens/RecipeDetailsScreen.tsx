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
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

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
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">(
    "ingredients"
  );
  const { recipeId } = route.params;

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  useEffect(() => {
    if (recipe) {
      setSelectedServings(2);
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
        ingredients: recipe.ingredients.map((ing) => ({
          ...ing,
          amount: adjustIngredientAmount(ing.amount),
        })),
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
          ingredients: recipe.ingredients.map((ing) => ({
            ...ing,
            amount: adjustIngredientAmount(ing.amount),
          })),
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
        return COLORS.difficultyEasy;
      case Difficulty.MEDIUM:
        return COLORS.difficultyMedium;
      case Difficulty.HARD:
        return COLORS.difficultyHard;
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
      const quantity = parseFloat(match[1].replace(",", "."));
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
      displayQuantity = displayQuantity.replace(/\.0+$/, "");

      return `${displayQuantity}${unit ? " " + unit : ""}`;
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleToggleFavorite}
        >
          <Ionicons
            name={recipe.isFavorite ? "bookmark" : "bookmark-outline"}
            size={28}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: recipe.imageUrl || "https://via.placeholder.com/800x400",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Categories */}
          {recipe.categories && recipe.categories.length > 0 && (
            <View style={styles.categoriesRow}>
              {recipe.categories.slice(0, 2).map((category) => (
                <View key={category.id} style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{category.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <Text style={styles.description}>{recipe.description}</Text>

          {/* Metadata Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}></Text>
              <Text style={styles.metaText}>{recipe.prepTimeMinutes} min</Text>
            </View>

            <Text style={styles.metaDivider}>|</Text>

            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}></Text>
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
            </View>

            <Text style={styles.metaDivider}>|</Text>

            <TouchableOpacity
              style={styles.nutritionButton}
              onPress={handleNutritionPress}
              activeOpacity={0.7}
              disabled={isCalculatingNutrition}
            >
              {isCalculatingNutrition ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Text style={styles.nutritionIcon}></Text>
                  <Text style={styles.nutritionText}>Valor Nutricional</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Servings Control */}
          <View style={styles.servingsControlContainer}>
            <TouchableOpacity
              style={styles.servingsControlButton}
              onPress={() =>
                setSelectedServings(Math.max(1, selectedServings - 1))
              }
              activeOpacity={0.7}
            >
              <Text style={styles.servingsControlButtonText}>−</Text>
            </TouchableOpacity>

            <View style={styles.servingsDisplayInline}>
              <Text style={styles.servingsDisplayText}>
                {selectedServings}{" "}
                {selectedServings === 1 ? "porción" : "porciones"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.servingsControlButton}
              onPress={() => setSelectedServings(selectedServings + 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.servingsControlButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs Navigation */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "ingredients" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("ingredients")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "ingredients" && styles.tabTextActive,
                ]}
              >
                Ingredientes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "steps" && styles.tabActive]}
              onPress={() => setActiveTab("steps")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "steps" && styles.tabTextActive,
                ]}
              >
                Pasos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "ingredients" && (
            <View style={styles.tabContent}>
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
          )}

          {activeTab === "steps" && (
            <View style={styles.tabContent}>
              {recipe.steps.map((step, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepContainer,
                    index === recipe.steps.length - 1 &&
                      styles.stepContainerLast,
                  ]}
                >
                  <View style={styles.stepHeader}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>
                        {step.stepNumber}
                      </Text>
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
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.cookButton}
          onPress={handleStartCooking}
          activeOpacity={0.8}
        >
          <Text style={styles.cookButtonText}>Empezar a Cocinar 👨‍🍳</Text>
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
              Receta original: {recipe?.servings}{" "}
              {recipe?.servings === 1 ? "porción" : "porciones"}
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
                  {selectedServings === 1 ? "porción" : "porciones"}
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.backgroundLight,
  },
  headerButton: {
    padding: 8,
  },
  headerIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  imageContainer: {
    width: "100%",
    height: 240,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.teal,
    fontWeight: "500",
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  metaDivider: {
    fontSize: 14,
    color: COLORS.teal,
    marginHorizontal: 12,
  },
  dropdownIcon: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  nutritionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },

  nutritionIcon: {
    fontSize: 16,
  },

  nutritionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  servingsControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    marginBottom: 4,
    gap: 16,
  },
  servingsControlButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  servingsControlButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  servingsDisplayInline: {
    minWidth: 100,
    alignItems: "center",
  },
  servingsDisplayText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    marginTop: 24,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 4,
    borderBottomColor: "transparent",
    backgroundColor: "transparent",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textTertiary,
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  tabContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ingredientBullet: {
    fontSize: 18,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  ingredientAmount: {
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  ingredientNotes: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontStyle: "italic",
    marginTop: 2,
  },
  stepContainer: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepContainerLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
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
    backgroundColor: COLORS.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.background,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  timerBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.peachLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  timerText: {
    fontSize: 14,
    color: COLORS.teal,
    fontWeight: "600",
  },
  bottomBar: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cookButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  servingsButtonDisabled: {
    backgroundColor: COLORS.borderLight,
  },
  servingsButtonText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.background,
  },
  servingsDisplay: {
    alignItems: "center",
    minWidth: 100,
  },
  servingsNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  servingsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  quickServingButtonActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  quickServingText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  quickServingTextActive: {
    color: COLORS.primary,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.background,
  },
});
