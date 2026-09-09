// src/config/keycloak.js
import Keycloak from 'keycloak-js';
import GATEWAY_URL from './gateway';

const keycloakConfig = {
  url: GATEWAY_URL,
  realm: 'smk3',                
  clientId: 'smk3-web-client'   
};

// Buat instance-nya tapi JANGAN di-init dulu di sini
const keycloak = new Keycloak(keycloakConfig);

// Guard: React StrictMode (dev) memasang effect dua kali. Tanpa guard ini
// keycloak.init() terpanggil ulang dan sempat mengosongkan token,
// sehingga request pertama tiap halaman terkirim tanpa Authorization.
let initPromise = null;

// Browser hanya menyediakan crypto.randomUUID dan crypto.subtle pada secure
// context (HTTPS/localhost). Saat demo diakses lewat IP LAN dengan HTTP biasa,
// randomUUID dipolyfill dari getRandomValues (tetap acak kriptografis) dan PKCE
// dimatikan karena butuh crypto.subtle.
const secureContext =
  typeof window !== 'undefined' && window.isSecureContext && !!window.crypto?.subtle;

if (typeof window !== 'undefined' && window.crypto?.getRandomValues && !window.crypto.randomUUID) {
  window.crypto.randomUUID = () => {
    const b = window.crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  };
}

const pkceMethod = secureContext ? 'S256' : false;

export function initKeycloak(options = {}) {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      pkceMethod,
      ...options,
    });
  }
  return initPromise;
}

export default keycloak;
