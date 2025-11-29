import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Recipe, Difficulty } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return { bg: '#dcfce7', text: '#16a34a' }; // green
      case Difficulty.MEDIUM:
        return { bg: '#fef9c3', text: '#ca8a04' }; // yellow
      case Difficulty.HARD:
        return { bg: '#fee2e2', text: '#dc2626' }; // red
    }
  };

  const colors = getDifficultyColor(recipe.difficulty);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/400x300' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {recipe.difficulty}
            </Text>
          </View>
          {recipe.isFavorite && (
            <Text style={styles.favorite}>⭐</Text>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>

        {/* Categorías */}
        {recipe.categories && recipe.categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            {recipe.categories.slice(0, 2).map((category) => (
              <View
                key={category.id}
                style={[
                  styles.categoryBadge,
                  { backgroundColor: category.color + '20' }
                ]}
              >
                <Text style={[styles.categoryText, { color: category.color }]}>
                  {category.icon} {category.name}
                </Text>
              </View>
            ))}
            {recipe.categories.length > 2 && (
              <Text style={styles.moreCategoriesText}>
                +{recipe.categories.length - 2}
              </Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeIcon}>⏱️</Text>
            <Text style={styles.timeText}>{recipe.prepTimeMinutes} min</Text>
          </View>
          <Text style={styles.servings}>{recipe.servings} porciones</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  favorite: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '500',
  },
  servings: {
    fontSize: 14,
    color: '#9ca3af',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreCategoriesText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
