import apiHelper, { BASE_URL } from "../../../helpers/apiHelperManajemen";

export const JENIS_DOKUMEN = [
  { nilai: "rapor", label: "Rapor", kolom: "raporFile" },
  { nilai: "ijazah", label: "Ijazah", kolom: "ijazahFile" },
  { nilai: "skl", label: "SKL", kolom: "sklFile" },
];

/** Menyusun dokumen siswa per jenis; file lama tanpa entri tetap ikut tampil. */
export function kelompokkanDokumen(siswa) {
  const daftar = Array.isArray(siswa?.dokumen) ? siswa.dokumen : [];
  const hasil = {};

  JENIS_DOKUMEN.forEach(({ nilai, kolom }) => {
    const milikJenis = daftar.filter((d) => d.jenis === nilai);
    if (!milikJenis.length && siswa?.[kolom]) {
      milikJenis.push({
        id: `warisan-${nilai}`,
        jenis: nilai,
        nama: String(siswa[kolom]).split("/").pop(),
        path: siswa[kolom],
        ukuran: 0,
      });
    }
    hasil[nilai] = milikJenis;
  });

  return hasil;
}

export function ukuranTerbaca(byte) {
  if (!byte) return "";
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 * 1024) return `${Math.round(byte / 1024)} KB`;
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`;
}

async function ambilBlob(url) {
  const res = await apiHelper.fetchData(url);
  if (!res.ok) {
    const pesan = await res.json().catch(() => null);
    throw new Error(pesan?.message || "Gagal membuka dokumen");
  }
  return res.blob();
}

async function unduhBlob(url, namaFile) {
  const blob = await ambilBlob(url);
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}

// Tab baru tidak bisa mengirim header Authorization, jadi file dibuka lewat blob URL.
// Tab dibuka lebih dulu (masih dalam gestur klik) agar tidak diblokir popup blocker.
async function bukaBlob(url) {
  const tab = window.open("", "_blank");
  try {
    const blob = await ambilBlob(url);
    const objectUrl = window.URL.createObjectURL(blob);
    if (tab) tab.location.href = objectUrl;
    else window.open(objectUrl, "_blank", "noopener");
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
  } catch (error) {
    tab?.close();
    throw error;
  }
}

export async function getDokumenSaya() {
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/saya`);
  if (!res.ok) {
    const pesan = await res.json().catch(() => null);
    throw new Error(pesan?.message || "Data siswa untuk akun ini tidak ditemukan");
  }
  const json = await res.json();
  return json.data;
}

export async function lihatDokumenSaya(dokumenId) {
  return bukaBlob(`${BASE_URL}/siswa/saya/dokumen/${dokumenId}`);
}

export async function unduhDokumenSaya(dokumenId, namaFile) {
  return unduhBlob(`${BASE_URL}/siswa/saya/dokumen/${dokumenId}?unduh=1`, namaFile);
}

export async function cariSiswaUntukGuru(q = "") {
  const url = q
    ? `${BASE_URL}/siswa/search?q=${encodeURIComponent(q)}`
    : `${BASE_URL}/siswa?limit=200&offset=0`;
  const res = await apiHelper.fetchData(url);
  if (!res.ok) throw new Error("Gagal memuat data siswa");
  const json = await res.json();
  return json.data?.siswa || [];
}

export async function unggahDokumenSiswa(siswaId, jenis, files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("file", file));

  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/${siswaId}/upload/${jenis}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const pesan = await res.json().catch(() => null);
    throw new Error(pesan?.message || `Gagal mengunggah ${jenis}`);
  }
  const json = await res.json();
  return json.data;
}

export async function lihatDokumenSiswa(siswaId, dokumenId) {
  return bukaBlob(`${BASE_URL}/siswa/${siswaId}/dokumen/${dokumenId}`);
}

export async function unduhDokumenSiswa(siswaId, dokumenId, namaFile) {
  return unduhBlob(`${BASE_URL}/siswa/${siswaId}/dokumen/${dokumenId}?unduh=1`, namaFile);
}

export async function hapusDokumenSiswa(siswaId, dokumenId) {
  const res = await apiHelper.fetchData(`${BASE_URL}/siswa/${siswaId}/dokumen/${dokumenId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const pesan = await res.json().catch(() => null);
    throw new Error(pesan?.message || "Gagal menghapus dokumen");
  }
  return res.json();
}
