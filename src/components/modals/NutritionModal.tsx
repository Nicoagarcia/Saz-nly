import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { RecipeNutrition } from "../../types";

interface NutritionModalProps {
  visible: boolean;
  onClose: () => void;
  nutrition: RecipeNutrition | null;
  recipeTitle: string;
}

export const NutritionModal: React.FC<NutritionModalProps> = ({
  visible,
  onClose,
  nutrition,
  recipeTitle,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!nutrition) {
    return null;
  }

  const hasMissingIngredients =
    nutrition.missing_ingredients && nutrition.missing_ingredients.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🍽️</Text>
              </View>
              <Text style={styles.title}>Información Nutricional</Text>
              <Text style={styles.subtitle}>Por porción</Text>
            </View>

            {/* Sección: Macronutrientes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Macronutrientes</Text>

              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabel}>
                  <Text style={styles.nutrientIcon}>🔥</Text>
                  <Text style={styles.nutrientName}>Calorías</Text>
                </View>
                <Text style={styles.nutrientValue}>
                  {nutrition.calories_per_serving}{" "}
                  <Text style={styles.unit}>kcal</Text>
                </Text>
              </View>

              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabel}>
                  <Text style={styles.nutrientIcon}>🍖</Text>
                  <Text style={styles.nutrientName}>Proteínas</Text>
                </View>
                <Text style={styles.nutrientValue}>
                  {nutrition.protein_g} <Text style={styles.unit}>g</Text>
                </Text>
              </View>

              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabel}>
                  <Text style={styles.nutrientIcon}>🍞</Text>
                  <Text style={styles.nutrientName}>Carbohidratos</Text>
                </View>
                <Text style={styles.nutrientValue}>
                  {nutrition.carbs_g} <Text style={styles.unit}>g</Text>
                </Text>
              </View>

              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabel}>
                  <Text style={styles.nutrientIcon}>🥑</Text>
                  <Text style={styles.nutrientName}>Grasas</Text>
                </View>
                <Text style={styles.nutrientValue}>
                  {nutrition.fat_g} <Text style={styles.unit}>g</Text>
                </Text>
              </View>
            </View>

            {/* Sección: Información Detallada */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Detallada</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fibra</Text>
                <Text style={styles.detailValue}>{nutrition.fiber_g}g</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Azúcares</Text>
                <Text style={styles.detailValue}>{nutrition.sugar_g}g</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sodio</Text>
                <Text style={styles.detailValue}>{nutrition.sodium_mg}mg</Text>
              </View>
            </View>

            {/* Sección: Vitaminas y Minerales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vitaminas y Minerales</Text>
              <Text style={styles.sectionSubtitle}>% Valor Diario</Text>

              <View style={styles.vitaminRow}>
                <Text style={styles.vitaminLabel}>Vitamina A</Text>
                <View style={styles.vitaminValueContainer}>
                  <View
                    style={[
                      styles.vitaminBar,
                      { width: `${Math.min(nutrition.vitamin_a_dv, 100)}%` },
                    ]}
                  />
                  <Text style={styles.vitaminValue}>
                    {nutrition.vitamin_a_dv}%
                  </Text>
                </View>
              </View>

              <View style={styles.vitaminRow}>
                <Text style={styles.vitaminLabel}>Vitamina C</Text>
                <View style={styles.vitaminValueContainer}>
                  <View
                    style={[
                      styles.vitaminBar,
                      { width: `${Math.min(nutrition.vitamin_c_dv, 100)}%` },
                    ]}
                  />
                  <Text style={styles.vitaminValue}>
                    {nutrition.vitamin_c_dv}%
                  </Text>
                </View>
              </View>

              <View style={styles.vitaminRow}>
                <Text style={styles.vitaminLabel}>Calcio</Text>
                <View style={styles.vitaminValueContainer}>
                  <View
                    style={[
                      styles.vitaminBar,
                      { width: `${Math.min(nutrition.calcium_dv, 100)}%` },
                    ]}
                  />
                  <Text style={styles.vitaminValue}>
                    {nutrition.calcium_dv}%
                  </Text>
                </View>
              </View>

              <View style={styles.vitaminRow}>
                <Text style={styles.vitaminLabel}>Hierro</Text>
                <View style={styles.vitaminValueContainer}>
                  <View
                    style={[
                      styles.vitaminBar,
                      { width: `${Math.min(nutrition.iron_dv, 100)}%` },
                    ]}
                  />
                  <Text style={styles.vitaminValue}>{nutrition.iron_dv}%</Text>
                </View>
              </View>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                {hasMissingIngredients
                  ? `⚠️ Valores aproximados - algunos ingredientes no tienen datos nutricionales completos (${nutrition.missing_ingredients?.join(
                      ", "
                    )})`
                  : "* Valores nutricionales aproximados basados en ingredientes estándar"}
              </Text>
            </View>

            {/* Botón Cerrar */}
            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    width: Dimensions.get("window").width - 48,
    maxWidth: 450,
    maxHeight: Dimensions.get("window").height * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    padding: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff7ed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 8,
  },
  nutrientLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  nutrientIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  nutrientName: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f97316",
  },
  unit: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  detailLabel: {
    fontSize: 15,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  vitaminRow: {
    marginBottom: 16,
  },
  vitaminLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
  },
  vitaminValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  vitaminBar: {
    height: 8,
    backgroundColor: "#f97316",
    borderRadius: 4,
    position: "absolute",
    left: 0,
  },
  vitaminValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f97316",
    marginLeft: "auto",
  },
  disclaimer: {
    backgroundColor: "#fef9c3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#854d0e",
    textAlign: "center",
    lineHeight: 16,
  },
  button: {
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
