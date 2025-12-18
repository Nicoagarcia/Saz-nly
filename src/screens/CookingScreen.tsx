import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Recipe, RootStackParamList, StepObjective } from "../types";
import { useBackgroundTimer } from "../hooks/useBackgroundTimer";
import { NotificationService } from "../services/notificationService";
import { TimerCompleteModal } from "../components/TimerCompleteModal";
import { StepProgressIndicator } from "../components/StepProgressIndicator";
import { COLORS } from "../constants/colors";

type CookingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Cooking"
>;
type CookingScreenRouteProp = RouteProp<RootStackParamList, "Cooking">;
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const steps: string[] = [
  "🧑‍🍳",
  "🥚",
  "🥦",
  "🥕",
  "🍅",
  "🍗",
  "🧄",
  "🧈",
  "🔪",
  "🍳",
  "🥣",
  "🥄",
  "🧂",
  "🍽️",
];
const shuffledSteps = shuffleArray(steps);

interface Props {
  navigation: CookingScreenNavigationProp;
  route: CookingScreenRouteProp;
}

export const CookingScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { recipe } = route.params;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [allStepsObjectives, setAllStepsObjectives] = useState<
    Record<number, StepObjective[]>
  >({});
  const [showTimerModal, setShowTimerModal] = useState(false);

  const currentStep = recipe.steps[currentStepIndex];
  const totalSteps = recipe.steps.length;

  const objectives = allStepsObjectives[currentStepIndex] || [];

  const {
    remainingSeconds: timer,
    isRunning: isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useBackgroundTimer({
    initialSeconds: currentStep.timerSeconds ?? null,
    stepTitle: currentStep.title,
    onComplete: async () => {
      await NotificationService.playSound();
      await NotificationService.triggerHaptic();
      setShowTimerModal(true);
    },
  });

  useEffect(() => {
    if (!allStepsObjectives[currentStepIndex]) {
      const newObjectives: StepObjective[] = currentStep.objectives.map(
        (task, index) => ({
          id: `${currentStep.stepNumber}-${index}`,
          task,
          isCompleted: false,
        })
      );
      setAllStepsObjectives((prev) => ({
        ...prev,
        [currentStepIndex]: newObjectives,
      }));
    }
  }, [
    currentStepIndex,
    currentStep.objectives,
    currentStep.stepNumber,
    allStepsObjectives,
  ]);

  useEffect(() => {
    const initNotifications = async () => {
      await NotificationService.cancelAllNotifications();
      await NotificationService.requestPermissions();
      await NotificationService.setupNotificationChannel();
      await NotificationService.loadSound();
    };

    initNotifications();

    return () => {
      NotificationService.cleanup();
    };
  }, []);

  const toggleObjective = (id: string) => {
    setAllStepsObjectives((prev) => ({
      ...prev,
      [currentStepIndex]: prev[currentStepIndex].map((obj) =>
        obj.id === id ? { ...obj, isCompleted: !obj.isCompleted } : obj
      ),
    }));
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      Alert.alert(
        "🎉 ¡Felicitaciones!",
        `Has completado la receta: ${recipe.title}`,
        [
          {
            text: "Ver receta",
            onPress: () => navigation.goBack(),
          },
          {
            text: "Volver al inicio",
            onPress: () => navigation.navigate("RecetasHome"),
          },
        ]
      );
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            Alert.alert(
              "Salir de la cocción",
              "¿Estás seguro que quieres salir? Perderás el progreso actual.",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir", onPress: () => navigation.goBack() },
              ]
            );
          }}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text
            style={styles.headerTitle}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {recipe.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            Paso {currentStepIndex + 1} de {totalSteps}
          </Text>
        </View>
      </View>

      <StepProgressIndicator
        totalSteps={totalSteps}
        currentStep={currentStepIndex}
        onStepPress={(stepIndex) => setCurrentStepIndex(stepIndex)}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      >
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>
          <Text style={styles.stepDescription}>{currentStep.description}</Text>
        </View>

        {timer !== null && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Temporizador</Text>
            <Text style={styles.timerDisplay}>{formatTime(timer)}</Text>

            {timer === 0 && !isTimerRunning ? (
              <TouchableOpacity style={styles.timerButton} onPress={resetTimer}>
                <Text style={styles.timerButtonText}>↻</Text>
              </TouchableOpacity>
            ) : isTimerRunning ? (
              <View style={styles.timerButtonsRow}>
                <TouchableOpacity
                  style={[styles.timerButton, styles.timerButtonSmall]}
                  onPress={pauseTimer}
                >
                  <Text style={styles.timerButtonText}>⏸</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timerButton, styles.timerButtonSmall]}
                  onPress={resetTimer}
                >
                  <Text style={styles.timerButtonText}>↻</Text>
                </TouchableOpacity>
              </View>
            ) : timer < (currentStep.timerSeconds ?? 0) ? (
              <View style={styles.timerButtonsRow}>
                <TouchableOpacity
                  style={[styles.timerButton, styles.timerButtonSmall]}
                  onPress={startTimer}
                >
                  <Text style={styles.timerButtonText}>▶</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timerButton, styles.timerButtonSmall]}
                  onPress={resetTimer}
                >
                  <Text style={styles.timerButtonText}>↻</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Estado inicial (nunca iniciado) - Solo mostrar play
              <TouchableOpacity style={styles.timerButton} onPress={startTimer}>
                <Text style={styles.timerButtonText}>▶</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.objectivesContainer}>
          <Text style={styles.objectivesTitle}>Objetivos del paso:</Text>
          {objectives.map((objective, index) => (
            <TouchableOpacity
              key={objective.id}
              style={styles.objectiveItem}
              onPress={() => toggleObjective(objective.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  objective.isCompleted && styles.checkboxCompleted,
                ]}
              >
                {objective.isCompleted && (
                  <Text style={styles.checkmark}>{shuffledSteps[index]}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.objectiveText,
                  objective.isCompleted && styles.objectiveTextCompleted,
                ]}
              >
                {objective.task}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton]}
          onPress={
            currentStepIndex === 0
              ? () => navigation.goBack()
              : handlePreviousStep
          }
        >
          <Text style={[styles.navButtonText]}>
            {currentStepIndex === 0 ? "Salir" : "Anterior"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNextStep}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextNext]}>
            {currentStepIndex === totalSteps - 1 ? "Finalizar" : "Siguiente"}
          </Text>
        </TouchableOpacity>
      </View>

      <TimerCompleteModal
        visible={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        stepTitle={currentStep.title}
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
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  closeIcon: {
    fontSize: 22,
    color: COLORS.background,
    fontWeight: "bold",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  timerContainer: {
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timerDisplay: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
    fontVariant: ["tabular-nums"],
  },
  timerButtonsRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  timerButton: {
    backgroundColor: COLORS.text,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timerButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  timerButtonText: {
    fontSize: 18,
    color: COLORS.background,
  },
  objectivesContainer: {
    marginBottom: 24,
  },
  objectivesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  objectiveItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
    padding: 12,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.background,
    fontWeight: "bold",
  },
  objectiveText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  objectiveTextCompleted: {
    color: COLORS.textTertiary,
    textDecorationLine: "line-through",
  },
  footer: {
    flexDirection: "row",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  prevButton: {
    backgroundColor: COLORS.backgroundLight,

    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  navButtonTextNext: {
    color: COLORS.background,
  },
  navButtonTextDisabled: {
    color: COLORS.textTertiary,
  },
});
