import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Recipe, RootStackParamList, StepObjective } from '../types';
import { useBackgroundTimer } from '../hooks/useBackgroundTimer';
import { NotificationService } from '../services/notificationService';
import { TimerCompleteModal } from '../components/TimerCompleteModal';
import { StepProgressIndicator } from '../components/StepProgressIndicator';
import { COLORS } from '../constants/colors';

type CookingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cooking'>;
type CookingScreenRouteProp = RouteProp<RootStackParamList, 'Cooking'>;

interface Props {
  navigation: CookingScreenNavigationProp;
  route: CookingScreenRouteProp;
}

export const CookingScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { recipe } = route.params;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [objectives, setObjectives] = useState<StepObjective[]>([]);
  const [showTimerModal, setShowTimerModal] = useState(false);

  const currentStep = recipe.steps[currentStepIndex];
  const totalSteps = recipe.steps.length;

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

  // Inicializar objetivos cuando cambia el paso
  useEffect(() => {
    const newObjectives: StepObjective[] = currentStep.objectives.map((task, index) => ({
      id: `${currentStep.stepNumber}-${index}`,
      task,
      isCompleted: false,
    }));
    setObjectives(newObjectives);
  }, [currentStepIndex, currentStep.objectives, currentStep.stepNumber]);

  // Inicializar servicios de notificación
  useEffect(() => {
    const initNotifications = async () => {
      // Cancelar todas las notificaciones antiguas al entrar a la pantalla
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
    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === id ? { ...obj, isCompleted: !obj.isCompleted } : obj
      )
    );
  };

  const allObjectivesCompleted = objectives.every((obj) => obj.isCompleted);

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Último paso completado
      Alert.alert(
        '🎉 ¡Felicitaciones!',
        `Has completado la receta: ${recipe.title}`,
        [
          {
            text: 'Ver receta',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Volver al inicio',
            onPress: () => navigation.navigate('Search'),
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            Alert.alert(
              'Salir de la cocción',
              '¿Estás seguro que quieres salir? Perderás el progreso actual.',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', onPress: () => navigation.goBack() },
              ]
            );
          }}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
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
            <TouchableOpacity
              style={[
                styles.timerButton,
                isTimerRunning && styles.timerButtonStop,
                timer === 0 && !isTimerRunning && styles.timerButtonReset,
              ]}
              onPress={() => {
                if (timer === 0 && !isTimerRunning) {
                  resetTimer();
                } else if (isTimerRunning) {
                  pauseTimer();
                } else {
                  startTimer();
                }
              }}
            >
              <Text style={styles.timerButtonText}>
                {timer === 0 && !isTimerRunning
                  ? '↻'
                  : isTimerRunning
                  ? '⏸'
                  : '▶'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.objectivesContainer}>
          <Text style={styles.objectivesTitle}>Objetivos del paso:</Text>
          {objectives.map((objective) => (
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
                  <Text style={styles.checkmark}>✓</Text>
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
          style={[
            styles.navButton,
            styles.prevButton,
            currentStepIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePreviousStep}
          disabled={currentStepIndex === 0}
        >
          <Text
            style={[
              styles.navButtonText,
              currentStepIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            ← Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            !allObjectivesCompleted && styles.navButtonDisabled,
          ]}
          onPress={handleNextStep}
          disabled={!allObjectivesCompleted}
        >
          <Text
            style={[
              styles.navButtonText,
              styles.navButtonTextNext,
              !allObjectivesCompleted && styles.navButtonTextDisabled,
            ]}
          >
            {currentStepIndex === totalSteps - 1 ? 'Finalizar' : 'Siguiente →'}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  closeIcon: {
    fontSize: 28,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: 4,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.peachLight,
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
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  timerContainer: {
    backgroundColor: COLORS.peachLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.teal,
    fontWeight: '600',
    marginBottom: 12,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.teal,
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
  },
  timerButton: {
    backgroundColor: COLORS.teal,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerButtonStop: {
    backgroundColor: COLORS.teal,
  },
  timerButtonReset: {
    backgroundColor: COLORS.teal,
  },
  timerButtonText: {
    fontSize: 24,
    color: COLORS.background,
  },
  objectivesContainer: {
    marginBottom: 24,
  },
  objectivesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  objectiveText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  objectiveTextCompleted: {
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: COLORS.backgroundLight,
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
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  navButtonTextNext: {
    color: COLORS.background,
  },
  navButtonTextDisabled: {
    color: COLORS.textTertiary,
  },
});
