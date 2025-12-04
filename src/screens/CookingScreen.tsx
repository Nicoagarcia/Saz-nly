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
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

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
      <StatusBar barStyle="light-content" backgroundColor="#f97316" />

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

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      >
        <View style={styles.stepContainer}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>{currentStep.stepNumber}</Text>
          </View>
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
                  ? 'Reiniciar'
                  : isTimerRunning
                  ? 'Pausar'
                  : 'Iniciar'}
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
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
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
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fed7aa',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#fef3c7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepNumberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  timerContainer: {
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  timerLabel: {
    fontSize: 14,
    color: '#9a3412',
    fontWeight: '600',
    marginBottom: 8,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f97316',
    marginBottom: 16,
  },
  timerButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  timerButtonStop: {
    backgroundColor: '#dc2626',
  },
  timerButtonReset: {
    backgroundColor: '#2563eb',
  },
  timerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  objectivesContainer: {
    marginBottom: 24,
  },
  objectivesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  objectiveText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  objectiveTextCompleted: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: '#f3f4f6',
  },
  nextButton: {
    backgroundColor: '#f97316',
  },
  navButtonDisabled: {
    backgroundColor: '#e5e7eb',
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  navButtonTextNext: {
    color: '#ffffff',
  },
  navButtonTextDisabled: {
    color: '#9ca3af',
  },
});
