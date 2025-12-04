/**
 * Sistema de colores para modo claro y oscuro
 */

export const lightColors = {
  // Colores principales
  primary: '#f97316',           // Naranja principal
  primaryLight: '#fff7ed',      // Naranja muy claro
  primaryMuted: '#fed7aa',      // Naranja sutil

  // Fondos
  background: '#ffffff',        // Fondo principal
  backgroundSecondary: '#f9fafb', // Fondo secundario
  backgroundTertiary: '#f3f4f6',  // Fondo terciario

  // Textos
  text: '#1f2937',              // Texto principal
  textSecondary: '#6b7280',     // Texto secundario
  textMuted: '#9ca3af',         // Texto sutil
  textInverted: '#ffffff',      // Texto invertido (sobre fondos oscuros)

  // Bordes
  border: '#e5e7eb',            // Bordes suaves
  borderLight: '#f3f4f6',       // Bordes muy suaves

  // Estados
  success: '#16a34a',           // Verde éxito
  successLight: '#dcfce7',      // Verde claro
  warning: '#ca8a04',           // Amarillo advertencia
  warningLight: '#fef9c3',      // Amarillo claro
  danger: '#dc2626',            // Rojo peligro
  dangerLight: '#fee2e2',       // Rojo claro

  // Específicos de timer
  timerBackground: '#fff7ed',
  timerLabel: '#9a3412',
  timerDisplay: '#f97316',
  timerButtonStart: '#f97316',
  timerButtonPause: '#dc2626',
  timerButtonReset: '#2563eb',

  // Barra de progreso
  progressBackground: '#fef3c7',
  progressFill: '#f97316',

  // Modal
  modalBackground: '#ffffff',
  modalOverlay: 'rgba(0, 0, 0, 0.6)',

  // Header
  headerBackground: '#f97316',
  headerText: '#ffffff',
  headerSubtext: '#fed7aa',
};

export const darkColors = {
  // Colores principales
  primary: '#fb923c',           // Naranja más suave para dark mode
  primaryLight: '#292524',      // Gris oscuro cálido
  primaryMuted: '#78350f',      // Naranja muy oscuro

  // Fondos
  background: '#0f172a',        // Azul muy oscuro (slate-900)
  backgroundSecondary: '#1e293b', // Azul oscuro (slate-800)
  backgroundTertiary: '#334155',  // Azul medio oscuro (slate-700)

  // Textos
  text: '#f1f5f9',              // Blanco casi puro
  textSecondary: '#cbd5e1',     // Gris claro
  textMuted: '#94a3b8',         // Gris medio
  textInverted: '#0f172a',      // Texto oscuro (sobre fondos claros)

  // Bordes
  border: '#334155',            // Gris azulado oscuro
  borderLight: '#1e293b',       // Gris azulado muy oscuro

  // Estados
  success: '#22c55e',           // Verde más brillante
  successLight: '#14532d',      // Verde oscuro
  warning: '#eab308',           // Amarillo más brillante
  warningLight: '#422006',      // Amarillo oscuro
  danger: '#ef4444',            // Rojo más brillante
  dangerLight: '#450a0a',       // Rojo oscuro

  // Específicos de timer
  timerBackground: '#292524',
  timerLabel: '#fdba74',
  timerDisplay: '#fb923c',
  timerButtonStart: '#fb923c',
  timerButtonPause: '#ef4444',
  timerButtonReset: '#3b82f6',

  // Barra de progreso
  progressBackground: '#422006',
  progressFill: '#fb923c',

  // Modal
  modalBackground: '#1e293b',
  modalOverlay: 'rgba(0, 0, 0, 0.8)',

  // Header
  headerBackground: '#ea580c',  // Naranja más intenso para dark
  headerText: '#ffffff',
  headerSubtext: '#fdba74',
};

export type ColorScheme = typeof lightColors;
