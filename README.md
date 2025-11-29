# 👨‍🍳 Saz-nly Mobile - Tu Asistente de Cocina

Aplicación mobile desarrollada con React Native y Expo que te guía paso a paso en tus recetas.

## 🚀 Características

- ✅ Base de datos SQLite local (sin conexión necesaria)
- ✅ Sistema de favoritos
- ✅ Búsqueda de recetas
- ✅ Modo de cocción paso a paso
- ✅ Temporizadores integrados
- ✅ Sistema de objetivos/checklist por paso

## 📱 Requisitos

- Node.js 18+ instalado
- Expo CLI
- Para Android: Dispositivo Android o emulador Android Studio
- Para iOS (opcional): Mac con Xcode

## 🛠️ Instalación

1. Instalar dependencias:

```bash
cd Saz-nly-mobile
npm install
```

2. Iniciar el servidor de desarrollo:

```bash
npm start
```

## 📲 Ejecutar en dispositivos

### Android (Recomendado)

**Opción 1: Dispositivo físico**

1. Instala Expo Go desde Play Store
2. Escanea el código QR que aparece en la terminal

**Opción 2: Emulador**

1. Instala Android Studio
2. Crea un AVD (Android Virtual Device)
3. Presiona `a` en la terminal de Expo

### iOS (Solo Mac)

1. Instala Expo Go desde App Store
2. Escanea el código QR

### Web (Para pruebas rápidas)

```bash
npm run web
```

## 📂 Estructura del Proyecto

```
Saz-nly-mobile/
├── src/
│   ├── components/
│   │   └── RecipeCard.tsx
│   ├── screens/
│   │   ├── SearchScreen.tsx
│   │   ├── RecipeDetailsScreen.tsx
│   │   └── CookingScreen.tsx
│   ├── services/
│   │   ├── database.ts       # Servicio SQLite
│   │   └── seed.ts           # Datos iniciales
│   └── types/
│       └── index.ts
├── App.tsx                    # Navegación principal
└── package.json
```

## 🗄️ Base de Datos

La app usa **Expo SQLite** para almacenar recetas localmente.

### Esquema de Base de Datos

- `recipes` - Recetas principales
- `ingredients` - Ingredientes de cada receta
- `steps` - Pasos de preparación
- `objectives` - Micro-tareas de cada paso

### Gestión de Recetas

El archivo `src/services/seed.ts` contiene 2 recetas de ejemplo:

- Pasta Carbonara Clásica
- Ensalada Caprese Fresca

Para agregar más recetas, edita `seed.ts` y ejecuta la app nuevamente (limpiará y repoblará la DB).

## 🎨 Paleta de Colores

- **Primario**: `#f97316` (Naranja chef)
- **Fácil**: `#16a34a` (Verde)
- **Medio**: `#ca8a04` (Amarillo)
- **Difícil**: `#dc2626` (Rojo)

## 🔧 Comandos Útiles

```bash
# Iniciar desarrollo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web

# Limpiar caché
npx expo start -c
```

## 📝 Agregar Nuevas Recetas

1. Abre `src/services/seed.ts`
2. Agrega una nueva llamada a `createRecipe()` siguiendo el formato existente
3. Reinicia la app

Ejemplo:

```typescript
createRecipe({
  title: "Nueva Receta",
  description: "Descripción...",
  prepTimeMinutes: 30,
  servings: 4,
  difficulty: Difficulty.EASY,
  imageUrl: "https://picsum.photos/seed/nueva/800/600",
  isFavorite: false,
  ingredients: [{ item: "Ingrediente 1", amount: "100g" }],
  steps: [
    {
      stepNumber: 1,
      title: "Paso 1",
      description: "Descripción del paso...",
      timerSeconds: 300,
      objectives: ["Objetivo 1", "Objetivo 2"],
    },
  ],
});
```

## 🐛 Troubleshooting

### Error: "Module not found"

```bash
npm install
npx expo start -c
```

### Error de SQLite

```bash
npm install expo-sqlite
```

### App no se conecta

- Verifica que tu PC y teléfono estén en la misma red WiFi
- Desactiva firewalls temporalmente
- Usa modo túnel: `npx expo start --tunnel`

## 📱 Próximos Pasos

- [ ] Publicar en Google Play Store
- [ ] Agregar más recetas
- [ ] Sistema de categorías
- [ ] Modo offline mejorado
- [ ] Compartir recetas

## 👨‍💻 Desarrollo

Desarrollado con:

- React Native 0.81
- Expo SDK 52
- TypeScript
- Expo SQLite
- React Navigation 7

## 📄 Licencia

MIT
