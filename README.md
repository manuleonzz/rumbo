# Rumbo 🪙

**Rumbo** es una app de presupuesto personal pensada para llevarse como un juego, no como una hoja de cálculo. Con Monedín como guía, cada semana registras lo que ganas, lo que gastas y lo que ahorras — sin agobios y sin montones de números.

Este proyecto nació como muestra de que **cualquier persona puede construir una app web funcional y bien cuidada usando herramientas de IA**, sin ser programador profesional. Es de código abierto y está pensado para mejorarse con el tiempo.

## ✨ Qué hace

- **Presupuesto por categorías**: tú decides cuánto esperas gastar en cada cosa (el "previsto") y luego marcas lo que gastaste de verdad.
- **Ingresos semanales**: si te pagan cada semana, vas registrando cuánto llega cada vez.
- **Meta de ahorro mensual**: el día 1 de cada mes, Monedín te pregunta cuánto quieres ahorrar. Cada domingo, registras (o dejas que se calcule solo) cuánto ahorraste esa semana.
- **Modo Simple**: los números importantes aparecen borrosos por defecto — tócalos para revelarlos. Pensado para no agobiar con cifras a primera vista.
- **Modo noche**.
- **Gamificación real**: XP, niveles, medallas por hitos que de verdad importan (nada de puntos por tocar botones), racha, celebraciones con sonido cuando subes de nivel o cumples tu ahorro semanal.
- **Onboarding guiado** y un resumen semanal tipo "historia" que te cuenta cómo te fue.
- **Cuentas reales con email y contraseña**: tus datos viven en la nube (Supabase) y te siguen entre dispositivos — entra desde el ordenador o el móvil y ves lo mismo.

## 🛠️ Cómo está hecho

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [lucide-react](https://lucide.dev/) para los iconos
- [recharts](https://recharts.org/) para las gráficas
- Web Audio API para los sonidos (sin archivos de audio externos)
- [Supabase](https://supabase.com/) para autenticación (email + contraseña) y guardado de datos en la nube, a través de una capa propia (`src/lib/CloudDataContext.jsx` + `usePersistentState.js`) pensada para poder cambiarse por otro proveedor sin tocar el resto de la app.

## 🔑 Configurar Supabase (necesario para que funcione)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En el **SQL Editor** del proyecto, ejecuta esto una vez para crear la tabla y sus reglas de seguridad:

   ```sql
   create table if not exists public.user_data (
     user_id uuid references auth.users(id) on delete cascade not null,
     key text not null,
     value jsonb not null,
     updated_at timestamptz default now(),
     primary key (user_id, key)
   );

   alter table public.user_data enable row level security;

   create policy "Los usuarios ven solo sus propios datos"
     on public.user_data for select using (auth.uid() = user_id);
   create policy "Los usuarios crean solo sus propios datos"
     on public.user_data for insert with check (auth.uid() = user_id);
   create policy "Los usuarios editan solo sus propios datos"
     on public.user_data for update using (auth.uid() = user_id);
   create policy "Los usuarios borran solo sus propios datos"
     on public.user_data for delete using (auth.uid() = user_id);
   ```

3. En **Project Settings → API Keys**, copia la **Project URL** y la **Publishable key**.
4. Para desarrollo local: copia `.env.example` como `.env.local` y pega ahí esos dos valores.
5. Para el sitio ya publicado: en tu repo de GitHub, ve a **Settings → Secrets and variables → Actions** y crea dos *repository secrets*:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   (el flujo de despliegue ya está preparado para leerlos automáticamente en cada build)

> Nota: por defecto, Supabase pide confirmar el email al crear una cuenta. Para pruebas rápidas en familia, puedes desactivarlo en **Authentication → Providers → Email → "Confirm email"**.

## 🚀 Cómo correrlo en tu máquina

```bash
npm install
npm run dev
```

Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`).

## 📦 Cómo desplegarlo en GitHub Pages

Este repo ya trae un flujo de GitHub Actions (`.github/workflows/deploy.yml`) que construye y publica la app automáticamente cada vez que subes cambios a la rama `main`.

Pasos para activarlo la primera vez:

1. Sube este proyecto a un repositorio de GitHub.
2. En el repo, ve a **Settings → Pages** y en "Build and deployment" elige **GitHub Actions** como origen.
3. Si tu repositorio **no** se llama `rumbo`, abre `vite.config.js` y cambia la línea `base: "/rumbo/"` por `base: "/nombre-de-tu-repo/"`.
4. Haz `git push` a `main`. En la pestaña **Actions** del repo verás el despliegue en marcha; al terminar, tu app estará en `https://tu-usuario.github.io/rumbo/`.

## 📁 Estructura del proyecto

```
rumbo/
├── src/
│   ├── App.jsx               # toda la lógica y la interfaz de la app
│   ├── AuthGate.jsx           # pantalla de login/registro y puerta de acceso
│   ├── main.jsx               # punto de entrada de React
│   ├── index.css              # reset mínimo
│   ├── assets/
│   │   └── monedin.png        # la mascota
│   └── lib/
│       ├── supabaseClient.js       # conexión a Supabase
│       ├── AuthContext.jsx         # sesión de usuario (login/logout)
│       ├── CloudDataContext.jsx    # caché + sincronización con la nube
│       └── usePersistentState.js   # hook que guarda el estado automáticamente
├── public/
│   └── monedin.png            # favicon
├── index.html
├── vite.config.js
├── package.json
└── .github/workflows/deploy.yml   # despliegue automático a GitHub Pages
```

## 🗺️ Próximos pasos

- Diseño específico para móvil.
- Medallas adicionales y un sistema de rachas comparadas entre familiares (sin mostrar cifras exactas).
- Recuperar contraseña olvidada (Supabase lo soporta, falta la pantalla).

## 🤝 Contribuir

Es un proyecto abierto. Si tienes ideas o mejoras, los *issues* y *pull requests* son bienvenidos.
