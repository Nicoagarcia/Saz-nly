import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configurar comportamiento por defecto de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,  // Deprecado, usar shouldShowBanner
    shouldShowBanner: true,  // Mostrar en la parte superior
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  private static sound: Audio.Sound | null = null;

  /**
   * Verifica si estamos en Expo Go (no en development build)
   */
  private static isExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
  }

  /**
   * Solicita permisos de notificaciones
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos de notificaciones:', error);
      return false;
    }
  }

  /**
   * Configura el canal de notificaciones (Android)
   */
  static async setupNotificationChannel() {
    if (Platform.OS === 'android') {
      try {
        // Eliminar canal anterior si existe (para testing)
        await Notifications.deleteNotificationChannelAsync('timer-channel');

        // Crear nuevo canal con sonido personalizado
        await Notifications.setNotificationChannelAsync('timer-channel-v2', {
          name: 'Temporizador de Cocina',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'timer_complete',  // Sin extensión .mp3
          lightColor: '#f97316',
        });
      } catch (error) {
        console.error('Error configurando canal de notificaciones:', error);
      }
    }
  }

  /**
   * Carga el archivo de audio
   */
  static async loadSound() {
    try {
      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/timer_complete.mp3'),
        { shouldPlay: false }
      );
      this.sound = sound;
    } catch (error) {
      console.error('Error cargando sonido:', error);
    }
  }

  /**
   * Reproduce el sonido del timer
   */
  static async playSound() {
    try {
      if (this.sound) {
        await this.sound.replayAsync();
      }
    } catch (error) {
      console.error('Error reproduciendo sonido:', error);
    }
  }

  /**
   * Programa una notificación local
   */
  static async scheduleTimerNotification(
    seconds: number,
    stepTitle: string
  ): Promise<string | null> {
    try {
      // En Expo Go, las notificaciones no funcionan bien, así que las deshabilitamos
      if (this.isExpoGo()) {
        console.log(`[Notificación] Deshabilitada en Expo Go (${seconds}s) - Solo funcionará modal + sonido`);
        return 'expo-go-disabled'; // Retornar ID fake para no romper la lógica
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Permisos de notificación no otorgados');
        return null;
      }

      // Validar que el tiempo sea válido (mínimo 1 segundo)
      if (seconds < 1) {
        console.warn('Tiempo inválido para notificación:', seconds);
        return null;
      }

      console.log(`[Notificación] Programando para ${seconds} segundos - Paso: ${stepTitle}`);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Temporizador completado',
          body: `Paso: ${stepTitle}`,
          sound: 'timer_complete',  // Sin extensión
          data: { type: 'timer-complete' },
        },
        trigger: {
          seconds: seconds,
          channelId: Platform.OS === 'android' ? 'timer-channel-v2' : undefined,
        },
      });

      console.log(`[Notificación] Programada con ID: ${identifier}`);
      return identifier;
    } catch (error) {
      console.error('Error programando notificación:', error);
      return null;
    }
  }

  /**
   * Cancela una notificación programada
   */
  static async cancelNotification(identifier: string) {
    try {
      // Ignorar si es el ID fake de Expo Go
      if (identifier === 'expo-go-disabled') {
        return;
      }
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error cancelando notificación:', error);
    }
  }

  /**
   * Dispara feedback háptico
   */
  static async triggerHaptic() {
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error) {
      console.error('Error con feedback háptico:', error);
    }
  }

  /**
   * Cancela todas las notificaciones programadas
   */
  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[Notificación] Todas las notificaciones canceladas');
    } catch (error) {
      console.error('Error cancelando todas las notificaciones:', error);
    }
  }

  /**
   * Limpia recursos
   */
  static async cleanup() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      // Cancelar todas las notificaciones programadas
      await this.cancelAllNotifications();
    } catch (error) {
      console.error('Error limpiando recursos:', error);
    }
  }
}
