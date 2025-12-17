import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Category } from "../../types";
import { COLORS } from "../../constants/colors";

interface CategoryFilterModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategories: number[];
  onApplyFilters: (categoryIds: number[]) => void;
}

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  visible,
  onClose,
  categories,
  selectedCategories,
  onApplyFilters,
}) => {
  const [tempSelected, setTempSelected] = useState<number[]>(selectedCategories);

  useEffect(() => {
    setTempSelected(selectedCategories);
  }, [selectedCategories, visible]);

  const toggleCategory = (categoryId: number) => {
    setTempSelected((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleApply = () => {
    onApplyFilters(tempSelected);
    onClose();
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  const handleCancel = () => {
    setTempSelected(selectedCategories);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Filtrar por categorías</Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Subtitle */}
              <Text style={styles.subtitle}>
                {tempSelected.length === 0
                  ? "Selecciona las categorías que desees"
                  : `${tempSelected.length} ${
                      tempSelected.length === 1 ? "categoría seleccionada" : "categorías seleccionadas"
                    }`}
              </Text>

              {/* Categories Grid */}
              <ScrollView
                style={styles.categoriesScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.categoriesGrid}>
                  {categories.map((category) => {
                    const isSelected = tempSelected.includes(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryItem,
                          isSelected && styles.categoryItemSelected,
                        ]}
                        onPress={() => toggleCategory(category.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                          ]}
                        >
                          {isSelected && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.categoryText,
                            isSelected && styles.categoryTextSelected,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearButtonText}>Limpiar filtros</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApply}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyButtonText}>
                    Aplicar{tempSelected.length > 0 ? ` (${tempSelected.length})` : ""}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get("window").height * 0.8,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesScroll: {
    maxHeight: Dimensions.get("window").height * 0.5,
    paddingHorizontal: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundGray,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: "47%",
    maxWidth: "47%",
  },
  categoryItemSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    fontSize: 12,
    color: COLORS.background,
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
    flex: 1,
  },
  categoryTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  applyButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.background,
  },
});
