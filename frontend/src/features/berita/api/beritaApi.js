// src/features/berita/api/beritaApi.js
import apiGateway from '../../../config/axios';

const PREFIX_BERITA     = '/berita';
const PREFIX_AGENDA     = '/agenda';      // ← endpoint terpisah
const PREFIX_PENGUMUMAN = '/pengumuman';  // ← endpoint terpisah

export const AGENDA_CATEGORIES = [
  'akademik',
  'ekstrakurikuler',
  'outing',
  'libur',
  'ujian',
  'kegiatan',
  'lainnya',
];

export const PENGUMUMAN_TYPES = ['biasa', 'penting', 'sangat_penting', 'mendesak'];

/**
 * Bangun FormData: hanya field terisi yang dikirim supaya lolos validasi BE
 * (string kosong ditolak oleh @Length / @Matches / @IsEnum).
 */
function buildFormData(fields, imageFile) {
  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && !value.trim()) return;
    fd.append(key, typeof value === 'boolean' ? String(value) : value);
  });
  if (imageFile) fd.append('gambar', imageFile);
  return fd;
}

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

// ── Helper: extract array ─────────────────────────────────────────────────────
function extractArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

// ── Helper: generate slug ─────────────────────────────────────────────────────
function generateSlug(title) {
  return (
    title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-') +
    '-' + Date.now()
  );
}

// ── BERITA ────────────────────────────────────────────────────────────────────
async function getBerita() {
  const res = await apiGateway.get(`${PREFIX_BERITA}?page=1&limit=200`);
  return extractArray(res.data);
}
async function getBeritaById(id) {
  const res = await apiGateway.get(`${PREFIX_BERITA}/${id}`);
  return res.data;
}
async function postBerita(title, content, description, imageFile) {
  const fd = buildFormData(
    {
      title: title?.trim(),
      slug: generateSlug(title || ''),
      author: 'Admin',
      content: content?.trim(),
      description: description?.trim(),
    },
    imageFile
  );
  const res = await apiGateway.post(PREFIX_BERITA, fd, MULTIPART);
  return res.data;
}
async function putBerita(id, title, content, description, imageFile) {
  const fd = buildFormData({ title, content, description }, imageFile);
  const res = await apiGateway.put(`${PREFIX_BERITA}/${id}`, fd, MULTIPART);
  return res.data;
}
async function deleteBerita(id) {
  const res = await apiGateway.delete(`${PREFIX_BERITA}/${id}`);
  return res.data;
}
async function togglePinBerita(id) {
  const res = await apiGateway.put(`${PREFIX_BERITA}/${id}/toggle-pin`);
  return res.data;
}

// ── AGENDA ────────────────────────────────────────────────────────────────────
async function getAgenda() {
  const res = await apiGateway.get(PREFIX_AGENDA);
  return extractArray(res.data);
}
async function getAgendaById(id) {
  const res = await apiGateway.get(`${PREFIX_AGENDA}/${id}`);
  return res.data;
}
/** @param {object} payload {title,date,location,description,startTime,endTime,category,participants} */
async function postAgenda(payload, imageFile) {
  const res = await apiGateway.post(PREFIX_AGENDA, buildFormData(payload, imageFile), MULTIPART);
  return res.data;
}
async function putAgenda(id, payload, imageFile) {
  const res = await apiGateway.put(
    `${PREFIX_AGENDA}/${id}`,
    buildFormData(payload, imageFile),
    MULTIPART
  );
  return res.data;
}
async function deleteAgenda(id) {
  const res = await apiGateway.delete(`${PREFIX_AGENDA}/${id}`);
  return res.data;
}

// ── PENGUMUMAN ────────────────────────────────────────────────────────────────
async function getPengumuman() {
  const res = await apiGateway.get(PREFIX_PENGUMUMAN);
  return extractArray(res.data);
}
async function getPengumumanById(id) {
  const res = await apiGateway.get(`${PREFIX_PENGUMUMAN}/${id}`);
  return res.data;
}
/** @param {object} payload {title,content,description,type,author,expiredAt} */
async function postPengumuman(payload, imageFile) {
  const res = await apiGateway.post(
    PREFIX_PENGUMUMAN,
    buildFormData(payload, imageFile),
    MULTIPART
  );
  return res.data;
}
async function putPengumuman(id, payload, imageFile) {
  const res = await apiGateway.put(
    `${PREFIX_PENGUMUMAN}/${id}`,
    buildFormData(payload, imageFile),
    MULTIPART
  );
  return res.data;
}
async function deletePengumuman(id) {
  const res = await apiGateway.delete(`${PREFIX_PENGUMUMAN}/${id}`);
  return res.data;
}
async function togglePinPengumuman(id) {
  const res = await apiGateway.put(`${PREFIX_PENGUMUMAN}/${id}/toggle-pin`);
  return res.data;
}

// ── Export ────────────────────────────────────────────────────────────────────
const beritaApi = {
  getBerita, getBeritaById, postBerita, putBerita, deleteBerita, togglePinBerita,
  getAgenda, getAgendaById, postAgenda, putAgenda, deleteAgenda,
  getPengumuman, getPengumumanById, postPengumuman, putPengumuman, deletePengumuman,
  togglePinPengumuman,
};

export default beritaApi;