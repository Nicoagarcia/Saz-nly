import { useState, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { NotificationService } from "../services/notificationService";

interface UseBackgroundTimerOptions {
  initialSeconds: number | null;
  onComplete: () => void;
  stepTitle: string;
}

export const useBackgroundTimer = ({
  initialSeconds,
  onComplete,
  stepTitle,
}: UseBackgroundTimerOptions) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    initialSeconds
  );
  const [isRunning, setIsRunning] = useState(false);

  // Referencias para tracking
  const endTimeRef = useRef<number | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const startTimer = async () => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;

    console.log(`[Timer] Iniciando timer con ${remainingSeconds} segundos`);

    // Cancelar cualquier notificación anterior primero
    if (notificationIdRef.current) {
      await NotificationService.cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
      console.log(`[Timer] Notificación anterior cancelada`);
    }

    // Calcular tiempo de finalización
    endTimeRef.current = Date.now() + remainingSeconds * 1000;
    setIsRunning(true);

    // Programar notificación
    const notificationId = await NotificationService.scheduleTimerNotification(
      remainingSeconds,
      stepTitle
    );
    if (notificationId) {
      notificationIdRef.current = notificationId;
      console.log(`[Timer] Notificación programada: ${notificationId}`);
    }
  };

  const pauseTimer = async () => {
    setIsRunning(false);
    endTimeRef.current = null;

    // Cancelar notificación programada
    if (notificationIdRef.current) {
      await NotificationService.cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  };

  /**
   * Resetea el temporizador
   */
  const resetTimer = async () => {
    await pauseTimer();
    setRemainingSeconds(initialSeconds);
  };

  /**
   * Efecto principal del timer
   */
  useEffect(() => {
    if (!isRunning || endTimeRef.current === null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Actualizar cada 100ms para UI suave
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current! - now) / 1000)
      );

      setRemainingSeconds(remaining);

      if (remaining === 0) {
        setIsRunning(false);
        endTimeRef.current = null;
        onComplete();
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete]);

  /**
   * Manejo de AppState (foreground/background)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          isRunning &&
          endTimeRef.current !== null
        ) {
          const now = Date.now();
          const remaining = Math.max(
            0,
            Math.ceil((endTimeRef.current - now) / 1000)
          );

          setRemainingSeconds(remaining);

          if (remaining === 0) {
            setIsRunning(false);
            endTimeRef.current = null;
            onComplete();
          }
        }

        appStateRef.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isRunning, onComplete]);

  useEffect(() => {
    resetTimer();
  }, [initialSeconds]);

  return {
    remainingSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
