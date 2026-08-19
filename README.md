# Archivo Global de Avistamientos — guía de puesta en marcha

Arquitectura (todo con capa gratuita):

```
[Navegador]
   │  mapa Leaflet + OpenStreetMap (gratis, sin API key)
   │
   ├─► Cloudinary .......... guarda la imagen que sube el usuario
   │
   ├─► Supabase (Postgres) . guarda los casos, solo lectura pública
   │        de los "paid"
   │
   └─► Edge Function ──► Stripe Checkout ──► Webhook ──► marca el
       "create-checkout"     (cobra 1€)      "stripe-webhook"   caso
                                                                 como "paid"
```

Nadie puede insertar un caso directamente en la base de datos desde el
navegador (Row Level Security). Solo se publica cuando Stripe confirma el
pago mediante el webhook — así nadie puede saltarse el pago editando el
JavaScript del navegador.

## 1. Crear el proyecto en Supabase (gratis)

1. Ve a https://supabase.com → **New project**.
2. En **SQL Editor**, pega el contenido de `supabase/schema.sql` y ejecútalo.
3. En **Project Settings → API**, copia:
   - `Project URL` → lo usarás como `SUPABASE_URL`
   - `anon public key` → `SUPABASE_ANON_KEY`
   - `service_role key` → **secreta**, nunca la pongas en el HTML

## 2. Crear la cuenta de Cloudinary (gratis)

1. Regístrate en https://cloudinary.com.
2. Anota tu `Cloud name` (aparece en el Dashboard).
3. Ve a **Settings → Upload → Upload presets → Add upload preset**:
   - Signing Mode: **Unsigned**
   - Guarda el nombre del preset.

Esto permite subir imágenes directamente desde el navegador sin exponer
ninguna clave secreta.

## 3. Crear la cuenta de Stripe

1. Regístrate en https://stripe.com (soporta pagos internacionales con
   tarjeta, Apple Pay y Google Pay).
2. En modo **Test** primero, copia la `Secret key` (Developers → API keys).
3. Cuando todo funcione, activa tu cuenta (piden datos fiscales/bancarios
   básicos) y cambia a las claves de modo **Live**.

## 4. Desplegar las Edge Functions

Necesitas la Supabase CLI (gratis):

```bash
npm install -g supabase
supabase login
supabase link --project-ref TU_PROJECT_REF

# variables de entorno secretas (nunca van en el código ni en GitHub)
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
supabase secrets set SUPABASE_URL=https://TU-PROYECTO.supabase.co
supabase secrets set SITE_URL=https://tudominio.com

supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

## 5. Configurar el webhook en Stripe

1. En el Dashboard de Stripe → **Developers → Webhooks → Add endpoint**.
2. URL: `https://TU-PROYECTO.supabase.co/functions/v1/stripe-webhook`
3. Evento a escuchar: `checkout.session.completed`
4. Copia el **Signing secret** (`whsec_...`) → es el
   `STRIPE_WEBHOOK_SECRET` del paso 4.

## 6. Rellenar `index.html`

Edita el bloque `CONFIG` al principio del `<script>` con tus valores reales
de Supabase, Cloudinary y la URL de tu Edge Function `create-checkout`.

## 7. Subir a GitHub Pages

```bash
git init
git add .
git commit -m "Primera versión del archivo de avistamientos"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

En **Settings → Pages** del repositorio, activa Pages sobre la rama `main`
y, si quieres tu dominio propio, añádelo en **Custom domain** (y crea el
registro DNS `CNAME` correspondiente en tu proveedor de dominio).

## Moderación

De momento cualquier pago publica el caso automáticamente. Si más adelante
quieres poder rechazar contenido ofensivo o falso antes de publicarlo,
cambia el flujo para que el webhook marque el estado como `review` en vez
de `paid`, y añade un pequeño panel de administración (una página aparte,
protegida con tu `service_role key` en el servidor, nunca en el navegador)
donde apruebes o rechaces manualmente cada caso.

## Costes reales

- Supabase, Cloudinary, GitHub Pages, Leaflet/OpenStreetMap: **0€** en el
  rango de uso de un proyecto que empieza.
- Stripe: sin cuota fija, solo comisión por cobro (aprox. 1,5% + 0,25€ en
  pagos europeos) — con 1€ de precio, te quedan aprox. 0,60€ netos por
  informe publicado.
