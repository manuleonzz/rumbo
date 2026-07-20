# Rumbo 🪙

**Rumbo** es una app de presupuesto personal pensada para llevarse como un juego, no como una hoja de cálculo. Con Monedín como guía, cada semana registras lo que ganas, lo que gastas y lo que ahorras — sin agobios y sin montones de números.

Este proyecto nació como muestra de que **cualquier persona puede construir una app web funcional y bien cuidada usando herramientas de IA**, sin ser programador profesional. Es de código abierto y está pensado para mejorarse con el tiempo.

## ✨ Qué hace

- **Cuestionario financiero interactivo**: adapta el plan a pagos semanales, quincenales, mensuales o variables.
- **Ingresos flexibles**: permite ajustar cada cobro y registrar bonos o ingresos extraordinarios.
- **Gastos y movimientos visuales**: categorías por color, buscador, iconos y gráfico circular interactivo.
- **Historial mensual automático**: cada movimiento conserva su fecha real; al cambiar de mes el resumen empieza en cero sin borrar los meses anteriores.
- **Presupuestos por categorías**: reparte el dinero con sobres visuales y ajusta límites en tiempo real.
- **Metas de ahorro**: objetivos a corto, medio y largo plazo, además de ahorro sin fecha.
- **Control de deudas**: calcula cuotas restantes y una fecha estimada de finalización.
- **Tema claro y oscuro**, interfaz en **español e inglés** y diseño adaptable a móvil y ordenador.
- **Cuentas reales con email y contraseña**: los datos se sincronizan mediante Supabase entre dispositivos.
- **Demo independiente**: permite probar toda la experiencia con datos ficticios sin alterar una cuenta real.

Los presupuestos, suscripciones, metas y deudas continúan entre meses. Los gastos
e ingresos reales se calculan por separado para cada periodo (`AAAA-MM`) y los
datos antiguos se migran automáticamente al abrir la versión actualizada.

## 🛠️ Cómo está hecho

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [lucide-react](https://lucide.dev/) para los iconos
- [recharts](https://recharts.org/) para las gráficas
- [Supabase](https://supabase.com/) para autenticación (email + contraseña) y guardado de datos en la nube, a través de una capa propia (`src/lib/CloudDataContext.jsx`) pensada para poder cambiarse por otro proveedor sin tocar el resto de la app.

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

La URL y la clave *publishable* también están configuradas como respaldo público en
`src/lib/supabaseClient.js`. Las variables anteriores tienen prioridad y permiten
cambiar de proyecto sin modificar el código. Nunca añadas una clave `service_role`
o `sb_secret_` al repositorio.

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
├── app/                       # estilos de landing, panel, onboarding, móvil y modo oscuro
├── components/                # nueva interfaz y pantallas financieras
├── src/
│   ├── main.jsx               # punto de entrada de React
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

- Recuperación de contraseña desde la propia interfaz.
- Notificaciones configurables de presupuestos, suscripciones, deudas y metas.
- Más monedas y formatos regionales.

## 🤝 Contribuir

Es un proyecto abierto. Si tienes ideas o mejoras, los *issues* y *pull requests* son bienvenidos.
