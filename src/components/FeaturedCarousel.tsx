import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Recipe } from '../types';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 280;
const CARD_MARGIN = 12;

interface FeaturedCarouselProps {
  recipes: Recipe[];
  onRecipePress: (recipe: Recipe) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  recipes,
  onRecipePress
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // No mostrar nada si no hay recetas destacadas
  if (recipes.length === 0) {
    return null;
  }

  const renderFeaturedCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onRecipePress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://picsum.photos/800/600' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      {/* Badge de Destacado */}
      <View style={styles.featuredBadge}>
        <Text style={styles.featuredText}>⭐ Destacado</Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.metadata}>
          {/* Categorías */}
          {item.categories.length > 0 && (
            <View style={styles.categoriesRow}>
              {item.categories.slice(0, 2).map((cat) => (
                <View
                  key={cat.id}
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: cat.color + '30' }
                  ]}
                >
                  <Text style={[styles.categoryText, { color: cat.color }]}>
                    {cat.icon}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Dificultad y Tiempo */}
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              {item.difficulty} • {item.prepTimeMinutes} min
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ Destacados</Text>
        <Text style={styles.headerSubtitle}>Las mejores recetas para probar</Text>
      </View>

      <FlatList
        data={recipes}
        renderItem={renderFeaturedCard}
        keyExtractor={(item) => `featured-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        pagingEnabled={false}
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 20
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary
  },
  listContent: {
    paddingHorizontal: 20
  },
  card: {
    width: CARD_WIDTH,
    height: 180,
    marginRight: CARD_MARGIN,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.background,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  featuredText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  metadata: {
    gap: 6
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 6
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  }
});
