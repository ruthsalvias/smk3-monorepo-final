import { useState } from "react";
import ProfilLayout from "../layouts/ProfilLayout";

// DATA
const beritaTerbaru = [
  {
    id: 1,
    kategori: "AKADEMIK",
    tanggal: "13 Maret 2025",
    judul: "Jadwal Ujian Akhir Semester",
    ringkasan: "Siswa diharapkan mempersiapkan diri.",
    gambar:
      "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600",
  },
  {
    id: 2,
    kategori: "PRESTASI",
    tanggal: "13 Maret 2025",
    judul: "Juara Lomba Tingkat Kabupaten",
    ringkasan: "Siswa berhasil meraih juara 1.",
    gambar:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600",
  },
];

const pengumumanData = [
  {
    id: 1,
    judul: "PPDB Dibuka",
    isi: "Pendaftaran mulai 1 Juni 2025.",
  },
];

export default function BeritaPage() {
  const [search, setSearch] = useState("");

  const filtered = beritaTerbaru.filter((b) =>
    b.judul.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProfilLayout>
      {/* HERO */}
      <section style={{ padding: 40, background: "#0f1f4b", color: "#fff" }}>
        <h1>Berita & Informasi</h1>

        <input
          placeholder="Cari berita..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginTop: 20,
            padding: 10,
            borderRadius: 6,
            border: "none",
          }}
        />
      </section>

      {/* BERITA */}
      <section style={{ padding: 40 }}>
        <h2>Berita Terbaru</h2>

        {filtered.length === 0 ? (
          <p>Tidak ada berita</p>
        ) : (
          filtered.map((b) => (
            <div key={b.id} style={{ marginBottom: 20 }}>
              <img src={b.gambar} width="200" alt={b.judul} />
              <h3>{b.judul}</h3>
              <p>{b.ringkasan}</p>
            </div>
          ))
        )}
      </section>

      {/* PENGUMUMAN */}
      <section style={{ padding: 40, background: "#f5f5f5" }}>
        <h2>Pengumuman</h2>

        {pengumumanData.map((p) => (
          <div key={p.id}>
            <h3>{p.judul}</h3>
            <p>{p.isi}</p>
          </div>
        ))}
      </section>
    </ProfilLayout>
  );
}