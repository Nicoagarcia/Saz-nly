import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";

interface StepProgressIndicatorProps {
  totalSteps: number;
  currentStep: number; // 0-indexed
}

export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to current step when it changes
  useEffect(() => {
    if (totalSteps > 6 && scrollViewRef.current) {
      // Calculate approximate position to center current step
      const stepWidth = 76; // 36px circle + 40px connector
      const scrollPosition = Math.max(0, currentStep * stepWidth - 100);

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }, 100);
    }
  }, [currentStep, totalSteps]);

  const renderCircles = () => {
    return Array.from({ length: totalSteps }).map((_, index) => {
      const isCompleted = index < currentStep;
      const isCurrent = index === currentStep;
      const isUpcoming = index > currentStep;

      return (
        <React.Fragment key={index}>
          {/* Circle */}
          <View
            style={[
              styles.circle,
              isCompleted && styles.circleCompleted,
              isCurrent && styles.circleCurrent,
              isUpcoming && styles.circleUpcoming,
            ]}
          >
            <Text
              style={[
                styles.circleNumber,
                (isCompleted || isCurrent) && styles.circleNumberActive,
              ]}
            >
              {index + 1}
            </Text>
          </View>

          {/* Connector line */}
          {index < totalSteps - 1 && (
            <View
              style={[
                styles.connector,
                index < currentStep && styles.connectorCompleted,
              ]}
            />
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <View style={styles.container}>
      {totalSteps > 6 ? (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderCircles()}
        </ScrollView>
      ) : (
        <View style={styles.circlesRow}>{renderCircles()}</View>
      )}

      <Text style={styles.progressText}>
        Paso {currentStep + 1} de {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  circlesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  circleCurrent: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  circleCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  circleUpcoming: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  circleNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textSecondary,
  },
  circleNumberActive: {
    color: COLORS.background,
  },
  connector: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
  },
  connectorCompleted: {
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});
