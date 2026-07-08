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
- Todo se guarda **en tu propio navegador** (localStorage) — no hace falta cuenta ni conexión a internet para usarla.

## 🛠️ Cómo está hecho

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [lucide-react](https://lucide.dev/) para los iconos
- [recharts](https://recharts.org/) para las gráficas
- Web Audio API para los sonidos (sin archivos de audio externos)
- `localStorage` a través de una capa de almacenamiento propia (`src/lib/storage.js`), pensada para poder cambiarse en el futuro por una base de datos real (Supabase, Firebase...) sin tocar el resto de la app.

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
│   ├── App.jsx              # toda la lógica y la interfaz de la app
│   ├── main.jsx             # punto de entrada de React
│   ├── index.css            # reset mínimo
│   ├── assets/
│   │   └── monedin.png      # la mascota
│   └── lib/
│       ├── storage.js       # capa de almacenamiento (hoy: localStorage)
│       └── usePersistentState.js  # hook que guarda el estado automáticamente
├── index.html
├── vite.config.js
├── package.json
└── .github/workflows/deploy.yml   # despliegue automático a GitHub Pages
```

## 🗺️ Próximos pasos

- Cuentas de usuario reales (email + contraseña) para usar Rumbo desde varios dispositivos.
- Diseño específico para móvil.
- Medallas adicionales y un sistema de rachas comparadas entre familiares (sin mostrar cifras exactas).

## 🤝 Contribuir

Es un proyecto abierto. Si tienes ideas o mejoras, los *issues* y *pull requests* son bienvenidos.
