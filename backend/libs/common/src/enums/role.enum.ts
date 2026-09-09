/**
 * Keycloak realm roles for SMK3 Balige.
 * These must match exactly with the role names configured
 * in the Keycloak realm 'smk3balige'.
 */
export enum Role {
  MASTER_ADMIN = 'master_admin',
  ADMIN = 'admin',
  GURU = 'guru',
  SISWA = 'siswa',
}
