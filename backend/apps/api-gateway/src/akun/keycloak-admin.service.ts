import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

export interface KeycloakUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  enabled: boolean;
  emailVerified?: boolean;
  requiredActions?: string[];
  createdTimestamp?: number;
  attributes?: Record<string, string[]>;
}

export interface KeycloakRealmRole {
  id: string;
  name: string;
}

/** Error dari Keycloak yang membawa status HTTP agar bisa dipetakan controller. */
export class KeycloakApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Keycloak ${status}: ${body}`);
  }
}

/**
 * Pembungkus Keycloak Admin REST API memakai service account client `api-gateway`
 * (client credentials), bukan akun admin master.
 */
@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private token: string | null = null;
  private tokenExpiresAt = 0;

  private get baseUrl(): string {
    return (process.env.KEYCLOAK_ADMIN_URL || 'http://sekolah_keycloak:8080').replace(/\/+$/, '');
  }

  private get realm(): string {
    return process.env.KEYCLOAK_REALM || 'smk3';
  }

  private get clientId(): string {
    return process.env.KEYCLOAK_CLIENT_ID || 'api-gateway';
  }

  private get clientSecret(): string {
    return process.env.KEYCLOAK_SECRET || '';
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) return this.token;

    if (!this.clientSecret) {
      throw new InternalServerErrorException('KEYCLOAK_SECRET belum dikonfigurasi di api-gateway');
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const res = await fetch(`${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      this.logger.error(`Gagal mengambil token service account: ${res.status} ${await res.text()}`);
      throw new InternalServerErrorException('Tidak dapat terhubung ke Keycloak');
    }

    const data = (await res.json()) as { access_token: string; expires_in?: number };
    this.token = data.access_token;
    // Sisakan 30 detik agar token tidak kedaluwarsa di tengah request.
    this.tokenExpiresAt = Date.now() + Math.max(0, (data.expires_in ?? 60) - 30) * 1000;
    return this.token;
  }

  private async call<T>(method: string, path: string, data?: unknown, ulang = true): Promise<T> {
    const token = await this.getToken();
    const res = await fetch(`${this.baseUrl}/admin/realms/${this.realm}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: data === undefined ? undefined : JSON.stringify(data),
    });

    // Token bisa kedaluwarsa lebih cepat kalau Keycloak baru restart.
    if (res.status === 401 && ulang) {
      this.token = null;
      return this.call<T>(method, path, data, false);
    }

    if (!res.ok) {
      throw new KeycloakApiError(res.status, await res.text());
    }

    if (res.status === 204) return undefined as T;
    const teks = await res.text();
    return (teks ? JSON.parse(teks) : undefined) as T;
  }

  listUsers(max = 500): Promise<KeycloakUser[]> {
    return this.call<KeycloakUser[]>('GET', `/users?max=${max}&briefRepresentation=false`);
  }

  findByUsername(username: string): Promise<KeycloakUser[]> {
    return this.call<KeycloakUser[]>(
      'GET',
      `/users?username=${encodeURIComponent(username)}&exact=true`,
    );
  }

  getUser(id: string): Promise<KeycloakUser> {
    return this.call<KeycloakUser>('GET', `/users/${encodeURIComponent(id)}`);
  }

  async createUser(payload: {
    username: string;
    nama: string;
    email?: string;
    attributes?: Record<string, string[]>;
  }): Promise<string> {
    const [firstName, ...sisa] = payload.nama.trim().split(/\s+/);
    // Email diisi otomatis agar Keycloak tidak memunculkan aksi "Verify Profile" saat login.
    await this.call('POST', '/users', {
      username: payload.username,
      firstName: firstName || payload.username,
      lastName: sisa.join(' ') || payload.username,
      email: payload.email || `${payload.username}@smkn3balige.sch.id`,
      enabled: true,
      emailVerified: true,
      requiredActions: [],
      attributes: payload.attributes,
    });
    const found = await this.findByUsername(payload.username);
    if (!found.length) throw new InternalServerErrorException('Akun dibuat tetapi tidak ditemukan');
    return found[0].id;
  }

  /** PUT /users mengganti representasi user, jadi data lama harus digabung dulu. */
  async updateUser(id: string, payload: Partial<KeycloakUser>): Promise<void> {
    const detail = await this.getUser(id);
    await this.call('PUT', `/users/${encodeURIComponent(id)}`, {
      username: detail.username,
      firstName: detail.firstName,
      lastName: detail.lastName,
      email: detail.email,
      enabled: detail.enabled,
      emailVerified: detail.emailVerified ?? true,
      requiredActions: detail.requiredActions ?? [],
      attributes: detail.attributes,
      ...payload,
    });
  }

  deleteUser(id: string): Promise<void> {
    return this.call('DELETE', `/users/${encodeURIComponent(id)}`);
  }

  setPassword(id: string, password: string, temporary = false): Promise<void> {
    return this.call('PUT', `/users/${encodeURIComponent(id)}/reset-password`, {
      type: 'password',
      value: password,
      temporary,
    });
  }

  getRealmRoles(): Promise<KeycloakRealmRole[]> {
    return this.call<KeycloakRealmRole[]>('GET', '/roles');
  }

  getUserRealmRoles(id: string): Promise<KeycloakRealmRole[]> {
    return this.call<KeycloakRealmRole[]>('GET', `/users/${encodeURIComponent(id)}/role-mappings/realm`);
  }

  private async petakanRole(roleNames: string[]) {
    const semua = await this.getRealmRoles();
    return semua
      .filter((r) => roleNames.includes(r.name))
      .map((r) => ({ id: r.id, name: r.name }));
  }

  async assignRealmRoles(id: string, roleNames: string[]): Promise<void> {
    const dipilih = await this.petakanRole(roleNames);
    if (!dipilih.length) return;
    await this.call('POST', `/users/${encodeURIComponent(id)}/role-mappings/realm`, dipilih);
  }

  async removeRealmRoles(id: string, roleNames: string[]): Promise<void> {
    const dipilih = await this.petakanRole(roleNames);
    if (!dipilih.length) return;
    await this.call('DELETE', `/users/${encodeURIComponent(id)}/role-mappings/realm`, dipilih);
  }

  /** Verifikasi password lama lewat direct grant memakai client rahasia gateway. */
  async verifyPassword(username: string, password: string): Promise<boolean> {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      username,
      password,
      scope: 'openid',
    });
    const res = await fetch(`${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    return res.ok;
  }
}
