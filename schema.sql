-- =========================================================
-- Esquema de base de datos — Archivo de Avistamientos
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";

create table if not exists sightings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 80),
  description text not null check (char_length(description) between 3 and 1000),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  image_url text,
  occurred_at date,
  status text not null default 'pending' check (status in ('pending','paid','rejected')),
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_sightings_status on sightings(status);
create index if not exists idx_sightings_created on sightings(created_at desc);

-- Seguridad a nivel de fila: nadie puede insertar/editar directamente desde
-- el navegador. Todas las escrituras pasan por las Edge Functions, que usan
-- la service_role key (con permisos totales, nunca expuesta al cliente).
alter table sightings enable row level security;

-- Lectura pública SOLO de los casos ya pagados/verificados.
create policy "public_read_paid_sightings"
  on sightings for select
  using (status = 'paid');

-- No se crean policies de insert/update/delete para el rol anon:
-- por defecto, sin policy, la operación queda denegada. Correcto aquí.
