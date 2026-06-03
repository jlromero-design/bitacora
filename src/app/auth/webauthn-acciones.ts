"use server";

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createClient } from "@/lib/supabase/server";

// Extraer tipos de los parámetros de las funciones (no se re-exportan en v13)
type RegistrationResponseJSON  = Parameters<typeof verifyRegistrationResponse>[0]["response"];
type AuthenticationResponseJSON = Parameters<typeof verifyAuthenticationResponse>[0]["response"];
import { createAdminClient } from "@/lib/supabase/admin";

const RP_ID   = process.env.WEBAUTHN_RP_ID   || "localhost";
const RP_NAME = "Vale Juri · bitácora";
const ORIGIN  = process.env.WEBAUTHN_ORIGIN  || "http://localhost:3000";

// ── Registro (usuario ya autenticado) ──────────────────────────────────────

export async function iniciarRegistro() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const admin = createAdminClient();

  // Excluir credenciales ya registradas para no duplicar
  const { data: creds } = await admin
    .from("webauthn_credentials")
    .select("id, transports")
    .eq("user_id", user.id);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.email ?? user.id,
    attestationType: "none",
    excludeCredentials: (creds ?? []).map((c) => ({
      id: c.id,
      transports: c.transports ?? [],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  await admin.from("webauthn_challenges").insert({
    user_id: user.id,
    email: user.email,
    challenge: options.challenge,
    kind: "registration",
  });

  return { options };
}

export async function completarRegistro(
  credential: RegistrationResponseJSON,
  deviceName: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const admin = createAdminClient();

  const { data: row } = await admin
    .from("webauthn_challenges")
    .select("*")
    .eq("user_id", user.id)
    .eq("kind", "registration")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!row) return { error: "Desafío no encontrado o expirado" };

  // Consumir el desafío antes de verificar (prevent replay)
  await admin.from("webauthn_challenges").delete().eq("id", row.id);

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: row.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
  } catch (err) {
    return { error: `Verificación fallida: ${err}` };
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { error: "Verificación fallida" };
  }

  const { credential: cred, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  const { error: dbErr } = await admin.from("webauthn_credentials").insert({
    id: cred.id,
    user_id: user.id,
    public_key: isoBase64URL.fromBuffer(cred.publicKey),
    counter: cred.counter,
    device_type: credentialDeviceType,
    backed_up: credentialBackedUp,
    transports: credential.response.transports ?? [],
    device_name: deviceName.trim() || "Dispositivo",
  });

  if (dbErr) return { error: dbErr.message };
  return { ok: true };
}

// ── Autenticación (usuario NO autenticado aún) ─────────────────────────────

export async function iniciarAutenticacion(email: string) {
  const admin = createAdminClient();

  // Buscar el usuario por email para obtener sus credenciales
  const { data: { users }, error: usersErr } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (usersErr) return { error: "Error interno" };

  const targetUser = users.find((u) => u.email === email);
  if (!targetUser) return { error: "Sin credenciales biométricas" };

  const { data: creds } = await admin
    .from("webauthn_credentials")
    .select("id, transports")
    .eq("user_id", targetUser.id);

  if (!creds?.length) return { error: "Sin credenciales biométricas registradas" };

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "preferred",
    allowCredentials: creds.map((c) => ({
      id: c.id,
      transports: c.transports ?? [],
    })),
  });

  await admin.from("webauthn_challenges").insert({
    user_id: targetUser.id,
    email: targetUser.email,
    challenge: options.challenge,
    kind: "authentication",
  });

  return { options };
}

export async function completarAutenticacion(
  credential: AuthenticationResponseJSON,
  email: string,
) {
  const admin = createAdminClient();

  const { data: row } = await admin
    .from("webauthn_challenges")
    .select("*")
    .eq("email", email)
    .eq("kind", "authentication")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!row) return { error: "Desafío no encontrado o expirado" };

  await admin.from("webauthn_challenges").delete().eq("id", row.id);

  const { data: credRow } = await admin
    .from("webauthn_credentials")
    .select("*")
    .eq("id", credential.id)
    .single();

  if (!credRow) return { error: "Credencial no encontrada" };

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: row.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: credRow.id,
        publicKey: isoBase64URL.toBuffer(credRow.public_key),
        counter: credRow.counter,
        transports: credRow.transports ?? [],
      },
    });
  } catch (err) {
    return { error: `Verificación fallida: ${err}` };
  }

  if (!verification.verified) return { error: "Verificación fallida" };

  // Actualizar contador (anti-replay)
  await admin
    .from("webauthn_credentials")
    .update({
      counter: verification.authenticationInfo.newCounter,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", credRow.id);

  // Emitir un magic link token para crear la sesión del lado del cliente
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkErr || !linkData) return { error: "Error al crear sesión" };

  return {
    token: linkData.properties?.hashed_token as string,
    email,
  };
}

// ── Gestión de credenciales (usuario autenticado) ──────────────────────────

export async function listarCredenciales() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("webauthn_credentials")
    .select("id, device_name, device_type, backed_up, created_at, last_used_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { credentials: data ?? [] };
}

export async function eliminarCredencial(credentialId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("webauthn_credentials")
    .delete()
    .eq("id", credentialId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { ok: true };
}
