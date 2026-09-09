# SMK N 3 Balige — Monorepo

Satu repositori berisi frontend (React + Vite) dan backend (NestJS microservices),
dijalankan penuh dengan Docker Compose dan **hanya membuka satu port**.

```
frontend/          SPA React (Vite)
backend/           NestJS monorepo: api-gateway + 5 service
docker/gateway/    Nginx edge gateway (Dockerfile + konfigurasi)
docker/keycloak/   Realm export yang diimpor otomatis saat pertama kali jalan
tools/             Skrip operasional (pembuatan akun superadmin)
docker-compose.yml Seluruh stack
```

## Kenapa satu port

Service `gateway` (Nginx) adalah satu-satunya container yang mem-publish port ke host.
Semua yang lain hanya bisa diakses dari jaringan internal Docker.

| Path                                | Diteruskan ke              |
| ----------------------------------- | -------------------------- |
| `/`                                 | file statis SPA React      |
| `/api/`                             | `api-gateway` (NestJS)     |
| `/uploads/`                         | `service-berita`           |
| `/realms/`, `/resources/`, `/js/`   | Keycloak (login & token)   |
| `/admin/`                           | Keycloak admin console     |
| `/health`                           | health check gateway       |

Karena frontend, API, dan Keycloak berbagi origin yang sama, tidak ada masalah
CORS maupun cookie lintas domain.

## Menjalankan

```bash
cp .env.example .env      # lalu isi semua nilai "ganti-..."
docker compose up -d --build
```

Aplikasi terbuka di `http://localhost:8080` (ubah lewat `APP_PORT`).

### Variabel yang wajib benar

- `APP_PORT` — port di host.
- `PUBLIC_ORIGIN` — alamat yang dipakai pengguna di browser, **persis** termasuk
  skema dan port. Nilai ini dipakai untuk `CORS_ORIGIN` dan `KEYCLOAK_ISSUER`.
  Kalau salah, login akan ditolak dengan error issuer.

Contoh di belakang reverse proxy/HTTPS:

```
APP_PORT=8080
PUBLIC_ORIGIN=https://smkn3balige.sch.id
```

## Membuat akun superadmin

Realm `smk3` diimpor tanpa akun pengguna. Setelah stack jalan, buat satu akun
superadmin (sekaligus menulis `KEYCLOAK_SECRET` ke `.env`):

```bash
set KC_ADMIN_PASSWORD=<password admin Keycloak dari .env>
set MASTER_ADMIN_PASSWORD=<password untuk akun superadmin>
node tools/setup-master-admin.mjs masteradminsmk3

docker compose up -d --no-deps --force-recreate api-gateway
```

Skrip tidak pernah menampilkan password di layar.

## Perintah harian

```bash
docker compose ps                 # status
docker compose logs -f gateway    # log edge gateway
docker compose logs -f api-gateway
docker compose down               # stop (data tetap di volume)
docker compose down -v            # stop + hapus semua data
```

## Pengembangan tanpa Docker

```bash
cd frontend && npm install && npm run dev     # http://localhost:5173
cd backend  && npm install && npm run start:dev api-gateway
```

Dev server Vite otomatis menunjuk ke gateway; set `VITE_GATEWAY_URL` bila
gateway berjalan di alamat lain.

## Catatan keamanan

- `.env` tidak ikut ter-commit. Semua nilai `ganti-...` wajib diganti sebelum deploy.
- Blok `location /admin/` di [docker/gateway/default.conf](docker/gateway/default.conf)
  membuka Keycloak admin console pada origin publik. Hapus blok itu bila console
  cukup diakses lewat jaringan internal.
- Folder `backend/uploads` berisi data runtime pengguna dan tidak ikut ter-commit.
