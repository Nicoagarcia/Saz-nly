import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RecipeCard } from "../components/RecipeCard";
import { FeaturedCarousel } from "../components/FeaturedCarousel";
import {
  getAllRecipes,
  searchRecipes,
  getFavoriteRecipes,
  getAllCategories,
  getFeaturedRecipes,
} from "../services/database";
import { Recipe, RootStackParamList, Category } from "../types";
import { COLORS } from "../constants/colors";

type SearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Search"
>;

interface Props {
  navigation: SearchScreenNavigationProp;
}

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const flatListRef = React.useRef<FlatList>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    loadRecipes();
    loadCategories();
    loadFeaturedRecipes();
  }, [filter]);

  const loadCategories = () => {
    setCategories(getAllCategories());
  };

  const loadFeaturedRecipes = () => {
    setFeaturedRecipes(getFeaturedRecipes());
  };

  const loadRecipes = () => {
    if (filter === "favorites") {
      setRecipes(getFavoriteRecipes());
    } else {
      setRecipes(getAllRecipes());
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      loadRecipes();
    } else {
      const results = searchRecipes(query);
      setRecipes(results);
    }
  };

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate("RecipeDetails", { recipeId: recipe.id });
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const filteredRecipes = useMemo(() => {
    let results = recipes;

    if (selectedCategories.length > 0) {
      results = results.filter((r) =>
        r.categories.some((c) => selectedCategories.includes(c.id))
      );
    }

    return results;
  }, [recipes, selectedCategories]);

  const renderHeader = () => (
    <>
      {/* Carrusel de Destacados */}
      {filter === "all" && searchQuery === "" && (
        <FeaturedCarousel
          recipes={featuredRecipes}
          onRecipePress={handleRecipePress}
        />
      )}

      {/* Chips de Categorías */}
      {filter === "all" && (
        <View style={styles.categoryChipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChips}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategories.length === 0 && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategories([])}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategories.length === 0 &&
                    styles.categoryChipTextActive,
                ]}
              >
                Todas
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(cat.id) &&
                    styles.categoryChipActive,
                  selectedCategories.includes(cat.id) && {
                    borderColor: cat.color,
                  },
                ]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategories.includes(cat.id) && { color: cat.color },
                  ]}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Botón de Favoritas */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "favorites" && styles.filterButtonActive,
          ]}
          onPress={() => {
            // Toggle entre todas y favoritas
            if (filter === "favorites") {
              setFilter("all");
            } else {
              setFilter("favorites");
              setSearchQuery("");
              setSelectedCategories([]);
            }
          }}
        >
          <Text
            style={[
              styles.filterText,
              filter === "favorites" && styles.filterTextActive,
            ]}
          >
            ⭐ Favoritas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Header de Todas las Recetas */}
      {filter === "all" && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Todas las Recetas</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredRecipes.length}{" "}
            {filteredRecipes.length === 1
              ? "receta disponible"
              : "recetas disponibles"}
          </Text>
        </View>
      )}
    </>
  );

  // Renderizar el estado vacío
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {filter === "favorites"
          ? "No tienes recetas favoritas aún"
          : selectedCategories.length > 0
          ? "No hay recetas en las categorías seleccionadas"
          : "No se encontraron recetas"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header fijo con título */}
      <TouchableOpacity
        style={styles.header}
        onPress={scrollToTop}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>👨‍🍳 Saz-nly</Text>
        <Text style={styles.subtitle}>Tu asistente de cocina</Text>
      </TouchableOpacity>

      {/* Buscador fijo */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recetas..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.micButton}
            onPress={() => {
              // Placeholder para funcionalidad futura
              console.log("Búsqueda por voz - Próximamente");
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeCardContainer}>
            <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.teal,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 4,
  },
  micButton: {
    padding: 4,
  },
  micIcon: {
    fontSize: 20,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.background,
  },
  recipeCardContainer: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.teal,
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
  categoryChipsContainer: {
    marginBottom: 8,
  },
  categoryChips: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipActive: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.primary,
  },
});
