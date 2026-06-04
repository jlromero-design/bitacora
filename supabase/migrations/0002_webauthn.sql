-- ════════════════════════════════════════════════════════════
-- WebAuthn / Passkeys — credenciales biométricas por dispositivo
-- ════════════════════════════════════════════════════════════

-- ── Credenciales registradas (clave pública por dispositivo) ─
create table if not exists webauthn_credentials (
  id            text primary key,          -- credential_id en base64url (del autenticador)
  user_id       uuid not null references auth.users(id) on delete cascade,
  public_key    text not null,             -- clave pública en base64url
  counter       bigint not null default 0, -- contador anti-replay
  device_type   text,                      -- 'singleDevice' | 'multiDevice'
  backed_up     boolean not null default false,
  transports    text[],                    -- ['internal','hybrid',...]
  device_name   text not null default 'Dispositivo',
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz
);

alter table webauthn_credentials enable row level security;

-- El usuario puede leer y borrar sus propias credenciales
-- (el INSERT lo hace siempre el admin client, nunca el cliente)
drop policy if exists webauthn_credentials_read on webauthn_credentials;
create policy webauthn_credentials_read on webauthn_credentials
  for select using (auth.uid() = user_id);

drop policy if exists webauthn_credentials_delete on webauthn_credentials;
create policy webauthn_credentials_delete on webauthn_credentials
  for delete using (auth.uid() = user_id);

-- ── Desafíos temporales (5 min TTL) ──────────────────────────
create table if not exists webauthn_challenges (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  email      text,           -- para el flujo de autenticación (pre-login)
  challenge  text not null unique,
  kind       text not null check (kind in ('registration','authentication')),
  expires_at timestamptz not null default now() + interval '5 minutes',
  created_at timestamptz not null default now()
);

-- Los challenges se manejan únicamente desde el servidor (service role).
-- Nadie autenticado ni anónimo tiene acceso directo.
alter table webauthn_challenges enable row level security;

-- ── Índices ───────────────────────────────────────────────────
create index if not exists idx_webauthn_creds_user
  on webauthn_credentials(user_id);

create index if not exists idx_webauthn_challenges_email_kind
  on webauthn_challenges(email, kind);
