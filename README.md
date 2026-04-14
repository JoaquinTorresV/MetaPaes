# MetaPAES

Plataforma de estudio para la PAES construida con Expo, React Native, Expo Router y Supabase. El proyecto combina onboarding guiado, práctica adaptativa, seguimiento de progreso y tutoría asistida por IA para acompañar al estudiante durante todo su proceso de preparación.

## Características

- Onboarding guiado para configurar nombre, carrera, puntaje objetivo y asignaturas.
- Navegación por pestañas para dashboard, práctica, progreso, tutor y perfil.
- Modo examen dedicado con rutas separadas para simulaciones cronometradas.
- Práctica adaptativa con lógica de repetición espaciada SM-2.
- Cálculo de puntaje estimado y detección de áreas débiles por asignatura.
- Integración con Supabase para autenticación, persistencia y backend de datos.
- Funciones Edge para tutor conversacional y generación de preguntas.
- Compatible con web, Android e iOS mediante Expo.

## Stack

- Frontend: Expo, React Native, Expo Router, React 19
- Estado: Zustand y React Query
- Backend: Supabase Auth, PostgreSQL, RLS y Edge Functions
- IA: Claude a través de servicios del backend
- Persistencia local: react-native-mmkv
- Estilos y tema: configuración centralizada en src/config/theme.ts

## Estructura del proyecto

```text
app/
  (auth)/
  (tabs)/
  exam/
src/
  config/
  features/
  services/
  shared/
  store/
supabase/
  migrations/
  functions/
```

## Requisitos

- Node.js 18 o superior
- npm
- Cuenta y proyecto de Supabase
- Variables de entorno configuradas en .env.local

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo .env.local en la raíz con estas claves:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CLAUDE_API_KEY=your_claude_api_key
EXPO_PUBLIC_APP_ENV=development
```

## Scripts disponibles

```bash
npm start
npm run android
npm run ios
npm run web
```

## Ejecución local

1. Instala dependencias con npm install.
2. Configura .env.local.
3. Inicia el proyecto con npm start.
4. Usa w, a o i desde Expo para abrir web, Android o iOS según corresponda.

## Backend con Supabase

El proyecto incluye migraciones y funciones Edge en supabase/.

- supabase/migrations/001_init_schema.sql define el esquema base.
- supabase/functions/tutor-chat implementa el flujo de tutoría con IA.
- supabase/functions/generate-questions genera preguntas y las inserta en la base de datos.

Si vas a trabajar con un proyecto nuevo de Supabase, ejecuta tus migraciones antes de consumir la app.

## Flujo principal

1. El usuario entra por el flujo de autenticación.
2. Completa el onboarding con datos académicos.
3. La app construye la experiencia diaria en dashboard, práctica y progreso.
4. El tutor ayuda con dudas y material de estudio.
5. El modo examen permite evaluar desempeño en condiciones controladas.

## Desarrollo

- La navegación principal vive en app/ usando Expo Router.
- El estado global se concentra en src/store/.
- La lógica de práctica está en src/features/practice/utils/.
- La configuración visual está centralizada en src/config/.

## Estado del proyecto

La base técnica ya está armada, pero todavía hay módulos en desarrollo y partes de UI o flujos que pueden seguir evolucionando.

## Próximos pasos sugeridos

- Completar el onboarding pendiente.
- Consolidar persistencia de sesión.
- Añadir componentes UI reutilizables.
- Poblar datos iniciales de estudio en Supabase.

## Licencia

Proyecto privado. Ajusta esta sección si decides publicarlo con una licencia específica.
