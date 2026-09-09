// Menyiapkan role master_admin: membuat realm role, memberi izin manage-users
// pada service account api-gateway, membuat akun master admin, dan menulis
// konfigurasi Keycloak ke .env monorepo.
// Pakai: KC_ADMIN_PASSWORD=... MASTER_ADMIN_PASSWORD=... node tools/setup-master-admin.mjs [username]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// Keycloak diakses lewat port publik yang sama dengan aplikasi (edge gateway).
const KC = process.env.KC_URL || `http://localhost:${process.env.APP_PORT || '8080'}`;
const REALM = process.env.KC_REALM || 'smk3';
const ADMIN_USER = process.env.KC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.KC_ADMIN_PASSWORD;
const ENV_FILE = process.env.ENV_FILE || '.env';

const USERNAME = process.argv[2] || process.env.MASTER_ADMIN_USERNAME || 'masteradminsmk3';
const PASSWORD = process.env.MASTER_ADMIN_PASSWORD;

if (!ADMIN_PASS) {
  console.error('KC_ADMIN_PASSWORD belum diisi (password admin Keycloak).');
  process.exit(1);
}
if (!PASSWORD) {
  console.error('MASTER_ADMIN_PASSWORD belum diisi (password akun superadmin baru).');
  process.exit(1);
}

const IZIN_REALM_MANAGEMENT = ['manage-users', 'view-users', 'query-users'];

async function tokenAdmin() {
  const res = await fetch(`${KC}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: ADMIN_USER,
      password: ADMIN_PASS,
    }),
  });
  if (!res.ok) throw new Error(`Gagal token admin: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function api(token, path, options = {}) {
  const res = await fetch(`${KC}/admin/realms/${REALM}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${path} -> ${res.status} ${await res.text()}`);
  }
  const teks = await res.text();
  return teks ? JSON.parse(teks) : null;
}

async function main() {
  const token = await tokenAdmin();

  // 1. Realm role master_admin
  const roles = await api(token, '/roles');
  if (!roles.some((r) => r.name === 'master_admin')) {
    await api(token, '/roles', {
      method: 'POST',
      body: JSON.stringify({ name: 'master_admin', description: 'Admin utama pengelola akun' }),
    });
    console.log('Realm role master_admin dibuat');
  } else {
    console.log('Realm role master_admin sudah ada');
  }

  // 2. Service account api-gateway diberi izin kelola user
  const [clientGateway] = await api(token, '/clients?clientId=api-gateway');
  if (!clientGateway) throw new Error('Client api-gateway tidak ditemukan');

  if (
    clientGateway.publicClient ||
    !clientGateway.serviceAccountsEnabled ||
    !clientGateway.directAccessGrantsEnabled
  ) {
    await api(token, `/clients/${clientGateway.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...clientGateway,
        publicClient: false,
        serviceAccountsEnabled: true,
        // Dipakai gateway untuk memverifikasi password lama saat siswa ganti password.
        directAccessGrantsEnabled: true,
      }),
    });
    console.log('Client api-gateway diaktifkan sebagai confidential + service account');
  }

  const serviceAccount = await api(token, `/clients/${clientGateway.id}/service-account-user`);

  const [clientRealmMgmt] = await api(token, '/clients?clientId=realm-management');
  const roleRealmMgmt = await api(token, `/clients/${clientRealmMgmt.id}/roles`);
  const sudahDimiliki = await api(
    token,
    `/users/${serviceAccount.id}/role-mappings/clients/${clientRealmMgmt.id}`,
  );
  const perluDitambah = roleRealmMgmt
    .filter((r) => IZIN_REALM_MANAGEMENT.includes(r.name))
    .filter((r) => !sudahDimiliki.some((s) => s.name === r.name))
    .map((r) => ({ id: r.id, name: r.name }));

  if (perluDitambah.length) {
    await api(token, `/users/${serviceAccount.id}/role-mappings/clients/${clientRealmMgmt.id}`, {
      method: 'POST',
      body: JSON.stringify(perluDitambah),
    });
    console.log(`Izin service account ditambah: ${perluDitambah.map((r) => r.name).join(', ')}`);
  } else {
    console.log('Izin service account sudah lengkap');
  }

  // 3. Akun master admin
  let [user] = await api(token, `/users?username=${encodeURIComponent(USERNAME)}&exact=true`);
  if (!user) {
    await api(token, '/users', {
      method: 'POST',
      body: JSON.stringify({
        username: USERNAME,
        firstName: 'Master',
        lastName: 'Admin',
        enabled: true,
        emailVerified: true,
      }),
    });
    [user] = await api(token, `/users?username=${encodeURIComponent(USERNAME)}&exact=true`);
    console.log(`Akun ${USERNAME} dibuat`);
  } else {
    console.log(`Akun ${USERNAME} sudah ada`);
  }

  await api(token, `/users/${user.id}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify({ type: 'password', value: PASSWORD, temporary: false }),
  });

  // Required action yang tersisa membuat login direct grant ditolak Keycloak.
  await api(token, `/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      enabled: true,
      emailVerified: true,
      requiredActions: [],
      // Profil tanpa email dianggap belum lengkap oleh action "Verify Profile".
      email: user.email || `${USERNAME}@smkn3balige.sch.id`,
    }),
  });

  const realmRoles = await api(token, '/roles');
  const dimiliki = await api(token, `/users/${user.id}/role-mappings/realm`);
  const target = realmRoles
    .filter((r) => ['master_admin', 'admin'].includes(r.name))
    .filter((r) => !dimiliki.some((d) => d.name === r.name))
    .map((r) => ({ id: r.id, name: r.name }));
  if (target.length) {
    await api(token, `/users/${user.id}/role-mappings/realm`, {
      method: 'POST',
      body: JSON.stringify(target),
    });
    console.log(`Role diberikan: ${target.map((r) => r.name).join(', ')}`);
  }

  console.log(`\nSelesai. Akun superadmin siap dipakai: ${USERNAME}`);

  // 4. Tulis konfigurasi Keycloak ke .env (nilai secret tidak ditampilkan)
  const { value: secret } = await api(token, `/clients/${clientGateway.id}/client-secret`);
  if (!secret) throw new Error('Client secret api-gateway tidak tersedia');

  if (!existsSync(ENV_FILE)) throw new Error(`.env tidak ditemukan: ${ENV_FILE}`);
  let env = readFileSync(ENV_FILE, 'utf8');
  const setEnv = (kunci, nilai) => {
    const baris = `${kunci}=${nilai}`;
    const pola = new RegExp(`^${kunci}=.*$`, 'm');
    env = pola.test(env) ? env.replace(pola, baris) : `${env.trimEnd()}\n${baris}\n`;
  };
  setEnv('KEYCLOAK_SECRET', secret);
  setEnv('KEYCLOAK_ADMIN_URL', process.env.KC_INTERNAL_URL || 'http://keycloak:8080');
  setEnv('KEYCLOAK_REALM', REALM);
  setEnv('KEYCLOAK_PUBLIC_CLIENT_ID', process.env.KC_PUBLIC_CLIENT || 'smk3-web-client');
  writeFileSync(ENV_FILE, env);
  console.log(`Konfigurasi Keycloak ditulis ke ${ENV_FILE}`);

  console.log('Jalankan: docker compose up -d --no-deps --force-recreate api-gateway');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
