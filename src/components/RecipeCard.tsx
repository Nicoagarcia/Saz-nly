import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Recipe, Difficulty } from '../types';
import { COLORS } from '../constants/colors';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  compact?: boolean;
  cardWidth?: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, compact = false, cardWidth }) => {
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

  const colors = getDifficultyColor(recipe.difficulty);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        compact && styles.cardCompact,
        cardWidth && { width: cardWidth }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/400x300' }}
          style={[styles.image, compact && styles.imageCompact]}
          resizeMode="cover"
        />
        {/* Categorías superpuestas en la imagen */}
        {recipe.categories && recipe.categories.length > 0 && (
          <View style={styles.categoriesOverlay}>
            {recipe.categories.slice(0, compact ? 1 : 2).map((category) => (
              <View
                key={category.id}
                style={styles.categoryBadge}
              >
                <Text style={styles.categoryText}>
                  {category.name}
                </Text>
              </View>
            ))}
          </View>
        )}
        {recipe.isFavorite && (
          <View style={styles.favoriteOverlay}>
            <Text style={styles.favorite}>⭐</Text>
          </View>
        )}
      </View>

      <View style={[styles.content, compact && styles.contentCompact]}>
        <Text
          style={[styles.title, compact && styles.titleCompact]}
          numberOfLines={compact ? 1 : 2}
        >
          {recipe.title}
        </Text>

        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>
        )}

        {/* Footer con badges */}
        <View style={styles.footer}>
          <View style={styles.footerBadge}>
            <Text style={styles.footerBadgeIcon}>⏱️</Text>
            <Text style={styles.footerBadgeText}>{recipe.prepTimeMinutes} min</Text>
          </View>
          <View style={styles.footerBadge}>
            <Text style={styles.footerBadgeIcon}>📊</Text>
            <Text style={styles.footerBadgeText}>{recipe.difficulty}</Text>
          </View>
          <View style={styles.footerBadge}>
            <Text style={styles.footerBadgeIcon}>👥</Text>
            <Text style={styles.footerBadgeText}>{recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  cardCompact: {
    marginBottom: 0,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 200,
  },
  imageCompact: {
    height: 140,
  },
  categoriesOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  favoriteOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  favorite: {
    fontSize: 20,
  },
  content: {
    padding: 16,
  },
  contentCompact: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  titleCompact: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.peachLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  footerBadgeIcon: {
    fontSize: 14,
  },
  footerBadgeText: {
    fontSize: 12,
    color: COLORS.teal,
    fontWeight: '500',
  },
});
