import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RecipeCard } from "../components/RecipeCard";
import { CategoryFilterModal } from "../components/modals/CategoryFilterModal";
import { getAllCategories, getAllRecipes } from "../services/database";
import { Recipe, CategoriasStackParamList, Category } from "../types";
import { COLORS } from "../constants/colors";

type CategoriasScreenNavigationProp = NativeStackNavigationProp<
  CategoriasStackParamList,
  "CategoriasHome"
>;

interface Props {
  navigation: CategoriasScreenNavigationProp;
}

export const CategoriasScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<
    number[]
  >([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedCategory) {
        loadRecipesByCategory(selectedCategory.id);
      }
    }, [selectedCategory])
  );

  const loadCategories = () => {
    const allCategories = getAllCategories();
    setCategories(allCategories);
  };

  const displayedCategories = useMemo(() => {
    if (selectedCategoryFilters.length === 0) {
      return categories;
    }
    return categories.filter((cat) =>
      selectedCategoryFilters.includes(cat.id)
    );
  }, [categories, selectedCategoryFilters]);

  const loadRecipesByCategory = (categoryId: number) => {
    const allRecipes = getAllRecipes();
    const filtered = allRecipes.filter((recipe) =>
      recipe.categories.some((cat) => cat.id === categoryId)
    );
    setFilteredRecipes(filtered);
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    loadRecipesByCategory(category.id);
  };

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate("RecipeDetails", { recipeId: recipe.id });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setFilteredRecipes([]);
  };

  const getRecipeCountForCategory = (categoryId: number): number => {
    const allRecipes = getAllRecipes();
    return allRecipes.filter((recipe) =>
      recipe.categories.some((cat) => cat.id === categoryId)
    ).length;
  };

  const renderCategoryCard = ({ item }: { item: Category }) => {
    const recipeCount = getRecipeCountForCategory(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          { borderColor: item.color, backgroundColor: item.color + "15" },
        ]}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryIconContainer}>
          <Text style={styles.categoryEmoji}>{item.icon}</Text>
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>
          {recipeCount} {recipeCount === 1 ? "receta" : "recetas"}
        </Text>
      </TouchableOpacity>
    );
  };

  if (selectedCategory) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToCategories}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.categoryHeaderEmoji}>
              {selectedCategory.icon}
            </Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{selectedCategory.name}</Text>
              <Text style={styles.subtitle}>
                {filteredRecipes.length}{" "}
                {filteredRecipes.length === 1 ? "receta" : "recetas"}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          key="recipes-list"
          data={filteredRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.recipeCardContainer}>
              <RecipeCard
                recipe={item}
                onPress={() => handleRecipePress(item)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay recetas en esta categoría
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Categorías</Text>
          <Text style={styles.subtitle}>
            Explora recetas por categoría
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategoryModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={28} color={COLORS.primary} />
          {selectedCategoryFilters.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {selectedCategoryFilters.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        key="categories-grid"
        data={displayedCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryCard}
        numColumns={2}
        columnWrapperStyle={styles.categoryRow}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      />

      <CategoryFilterModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        selectedCategories={selectedCategoryFilters}
        onApplyFilters={(categoryIds) => {
          setSelectedCategoryFilters(categoryIds);
        }}
      />
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.teal,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "bold",
  },
  categoryRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    minHeight: 160,
    justifyContent: "center",
  },
  categoryIconContainer: {
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 48,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryHeaderEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  recipeCardContainer: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textTertiary,
    textAlign: "center",
  },
});
