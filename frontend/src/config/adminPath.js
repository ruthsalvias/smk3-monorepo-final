// Basis URL panel admin.
// Dibuat unik/tidak mudah ditebak supaya halaman admin tidak terekspos publik.
// Bisa dioverride lewat env VITE_ADMIN_PATH (harus diawali "/").
const raw = import.meta.env?.VITE_ADMIN_PATH || "/panel-n3b-7f4a92c1";

export const ADMIN_PATH = raw.startsWith("/") ? raw.replace(/\/+$/, "") : `/${raw}`;

/** Bangun path di dalam panel admin, contoh: adminPath("/berita") */
export const adminPath = (sub = "") => `${ADMIN_PATH}${sub}`;

export default ADMIN_PATH;
