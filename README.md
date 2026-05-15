# BarrioAlerta 🚨

App de seguridad y ayuda comunitaria hiper-local para México.

## Stack

- React 19 + Vite 6 + TypeScript
- Firebase (Auth, Firestore, Cloud Messaging)
- Gemini AI (análisis de imágenes)
- Capacitor 8 → APK nativa Android
- Pigeon Maps + MapTiler

## Setup inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# → Llenar TODAS las variables en .env

# 3. Desarrollo web
npm run dev

# 4. Build + sincronizar Android
npm run cap:sync

# 5. Abrir en Android Studio
npx cap open android
```

## Variables de entorno requeridas

Ver `.env.example` — **NUNCA subas `.env` al repositorio**.

## Estructura

```
src/
  components/    # UI por dominio (chat, incident, map, modals, ui)
  constants/     # Categorías y configuración
  hooks/         # useAuth, useIncidents, useChat, useLocation
  services/      # Firebase (config, incidentService, userService) + geminiService
  store/         # AppContext global
  types/         # TypeScript types
  utils/         # geo helpers, notifications
  views/         # DashboardView (vista principal)
```

## Play Store checklist

- [ ] Crear proyecto Firebase productivo (distinto al de desarrollo)
- [ ] Activar Google Sign-In en Firebase Auth
- [ ] Subir `google-services.json` al proyecto Android (NO al repo)
- [ ] Configurar AdMob con Ad Unit IDs reales
- [ ] Completar `Privacy Policy` y `Terms of Service` (requeridos por Google Play)
- [ ] Definir Content Rating en Play Console
- [ ] Crear íconos y screenshots para el listing
- [ ] Probar en dispositivo físico antes de subir

## Leyes aplicables (MX)

- LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de Particulares)
- Reglamento LFPDPPP
- NOM-151-SCFI-2016 (conservación de datos)
- Aviso de Privacidad obligatorio con detalle de datos recolectados: ubicación, nombre, foto, teléfono (opcional)
