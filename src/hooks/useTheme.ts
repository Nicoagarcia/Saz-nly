import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorScheme } from '../theme/colors';

/**
 * Hook para acceder al tema actual del sistema
 * Retorna los colores apropiados según el modo claro/oscuro del dispositivo
 */
export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors: ColorScheme = isDark ? darkColors : lightColors;

  useEffect(() => {
    console.log(`[TEMA] Modo ${isDark ? '🌙 OSCURO' : '☀️ CLARO'} activado`);
  }, [isDark]);

  return {
    colors,
    isDark,
    colorScheme,
  };
};
