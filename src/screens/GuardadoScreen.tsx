import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
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
import { getFavoriteRecipes, searchRecipes } from "../services/database";
import { Recipe, GuardadoStackParamList } from "../types";
import { COLORS } from "../constants/colors";

type GuardadoScreenNavigationProp = NativeStackNavigationProp<
  GuardadoStackParamList,
  "GuardadoHome"
>;

interface Props {
  navigation: GuardadoScreenNavigationProp;
}

export const GuardadoScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const flatListRef = React.useRef<FlatList>(null);
  const searchInputRef = React.useRef<TextInput>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = () => {
    setRecipes(getFavoriteRecipes());
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      loadFavorites();
    } else {
      // Search only within favorites
      const favorites = getFavoriteRecipes();
      const filtered = favorites.filter((recipe) =>
        recipe.title.toLowerCase().includes(query.toLowerCase())
      );
      setRecipes(filtered);
    }
  };

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate("RecipeDetails", { recipeId: recipe.id });
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="bookmark-outline"
        size={80}
        color={COLORS.textTertiary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No tienes recetas guardadas</Text>
      <Text style={styles.emptySubtitle}>
        Guarda tus recetas favoritas para acceder a ellas rápidamente
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={scrollToTop}
          activeOpacity={0.7}
        >
          <Text style={styles.title}>Guardado</Text>
          <Text style={styles.subtitle}>
            {recipes.length}{" "}
            {recipes.length === 1 ? "receta guardada" : "recetas guardadas"}
          </Text>
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="bookmark" size={28} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Buscar en guardados..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => {
              if (searchQuery) {
                handleSearch("");
              } else {
                searchInputRef.current?.focus();
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={searchQuery ? "close-circle" : "search"}
              size={20}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeCardContainer}>
            <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
          </View>
        )}
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 8,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SearchBar,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 4,
  },
  recipeCardContainer: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 400,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textTertiary,
    textAlign: "center",
    lineHeight: 24,
  },
});
