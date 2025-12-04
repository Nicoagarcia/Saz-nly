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
import { useTheme } from "../hooks/useTheme";

type SearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Search"
>;

interface Props {
  navigation: SearchScreenNavigationProp;
}

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = React.useRef<FlatList>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);

  const styles = createStyles(colors);

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

  // Filtrado de recetas con useMemo para optimizar
  const filteredRecipes = useMemo(() => {
    let results = recipes;

    // Filtrar por categoría
    if (selectedCategory !== null) {
      results = results.filter((r) =>
        r.categories.some((c) => c.id === selectedCategory)
      );
    }

    return results;
  }, [recipes, selectedCategory]);

  // Renderizar carrusel, chips y filtros (se desplazan con el scroll)
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
                selectedCategory === null && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === null && styles.categoryChipTextActive,
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
                  selectedCategory === cat.id && styles.categoryChipActive,
                  selectedCategory === cat.id && { borderColor: cat.color },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id && { color: cat.color },
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
              setSelectedCategory(null);
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
    </>
  );

  // Renderizar el estado vacío
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {filter === "favorites"
          ? "No tienes recetas favoritas aún"
          : selectedCategory !== null
          ? "No hay recetas en esta categoría"
          : "No se encontraron recetas"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Header fijo con título */}
      <TouchableOpacity style={styles.header} onPress={scrollToTop} activeOpacity={0.7}>
        <Text style={styles.title}>👨‍🍳 Saz-nly</Text>
        <Text style={styles.subtitle}>Tu asistente de cocina</Text>
      </TouchableOpacity>

      {/* Buscador fijo */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar recetas..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
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
    backgroundColor: colors.backgroundTertiary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textInverted,
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
    color: colors.textMuted,
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
    backgroundColor: colors.backgroundTertiary,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipActive: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.primary,
  },
});
