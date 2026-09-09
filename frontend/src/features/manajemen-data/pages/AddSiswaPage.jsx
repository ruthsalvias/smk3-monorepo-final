import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import { asyncPostSiswa } from "../states/action";
import manajemenApi from "../api/manajemenApi.js";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import Icon from "../../../components/Icon";
import "../resources/manajemen.css";

export default function AddSiswaPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    namaLengkap: "",
    jurusan: "",
    nisn: "",
    nis: "",
    kelas: "",
    tanggalLahir: "",
    alamat: "",
    noWaOrtu: "",
    status: "aktif",
    raporFile: "",
    sklFile: "",
    ijazahFile: "",
  });

  // Menyimpan file object sementara sebelum siswa dibuat
  const [pendingFiles, setPendingFiles] = useState({
    raporFile: null,
    sklFile: null,
    ijazahFile: null,
  });

  const [fileNames, setFileNames] = useState({
    raporFile: "",
    sklFile: "",
    ijazahFile: "",
  });

  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Simpan file sementara di state (belum upload)
  const handleFileSelect = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan");
      e.target.value = "";
      return;
    }

    setPendingFiles((prev) => ({ ...prev, [field]: file }));
    setFileNames((prev) => ({ ...prev, [field]: file.name }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // 1. Simpan data siswa dulu, dapat id dari response
      const result = await manajemenApi.postSiswa(form);
      const newId = result?.data?.siswa?.id || result?.data?.id || result?.id;

      if (!newId) throw new Error("ID siswa tidak ditemukan dari response");

      // 2. Upload file yang dipilih (jika ada)
      const typeMap = { raporFile: "rapor", sklFile: "skl", ijazahFile: "ijazah" };
      for (const [field, file] of Object.entries(pendingFiles)) {
        if (file) {
          await manajemenApi.uploadSiswaFile(newId, typeMap[field], file);
        }
      }

      navigate(adminPath("/data/siswa"));
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const dokumenFields = [
    { key: "raporFile",  label: "File Rapor" },
    { key: "sklFile",    label: "File SKL" },
    { key: "ijazahFile", label: "File Ijazah" },
  ];

  return (
    <AdminLayout>
      <section className="smk-section smk-bg-cream">

        {/* HEADER AREA */}
        <div className="smk-header-area">
          <h1 className="smk-section-title">
            Tambah <span className="text-primary">Siswa Baru</span>
          </h1>
          <p className="smk-section-subtitle">
            Isi semua data siswa dengan lengkap dan benar
          </p>
        </div>

        {/* FORM CARD */}
        <div className="smk-manajemen-container">

          <div style={{ borderTop: "1px solid #e5e7eb", margin: "50px 0" }} />

          <form onSubmit={handleSubmit}>

            {/* ── GRUP 1: Identitas Siswa ── */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon"><Icon name="students" size={20} /></div>
                <div>
                  <h2 className="form-section-title">Identitas Siswa</h2>
                  <p className="form-section-desc">Data pribadi dan identitas resmi siswa</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field col-span-2">
                  <label className="form-label">Nama Lengkap <span className="required">*</span></label>
                  <input
                    type="text"
                    name="namaLengkap"
                    placeholder="Masukkan nama lengkap siswa"
                    value={form.namaLengkap}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">NISN <span className="required">*</span></label>
                  <input
                    type="text"
                    name="nisn"
                    placeholder="Nomor Induk Siswa Nasional"
                    value={form.nisn}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">NIS</label>
                  <input
                    type="text"
                    name="nis"
                    placeholder="Nomor Induk Siswa"
                    value={form.nis}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="tanggalLahir"
                    value={form.tanggalLahir}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">No WA Orang Tua</label>
                  <input
                    type="text"
                    name="noWaOrtu"
                    placeholder="Contoh: 08123456789"
                    value={form.noWaOrtu}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-field col-span-2">
                  <label className="form-label">Alamat</label>
                  <textarea
                    name="alamat"
                    placeholder="Masukkan alamat lengkap siswa"
                    value={form.alamat}
                    onChange={handleChange}
                    className="form-input form-textarea"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="form-divider" />

            {/* ── GRUP 2: Akademik ── */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon"><Icon name="book" size={20} /></div>
                <div>
                  <h2 className="form-section-title">Data Akademik</h2>
                  <p className="form-section-desc">Informasi kelas, jurusan, dan status siswa</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Kelas <span className="required">*</span></label>
                  <input
                    type="text"
                    name="kelas"
                    placeholder="Contoh: IF 23"
                    value={form.kelas}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Jurusan</label>
                  <input
                    type="text"
                    name="jurusan"
                    placeholder="Contoh: Teknik Informatika"
                    value={form.jurusan}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Status Siswa</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="lulus">Lulus</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(adminPath("/data/siswa"))}
                className="btn-cancel"
              >
                Batal
              </button>
              <button type="submit" className="btn-save" disabled={uploading}>
                {uploading ? "Menyimpan..." : "Simpan Siswa"}
              </button>
            </div>

          </form>

          <div style={{ borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />
        </div>

        

      </section>
    </AdminLayout>
  );
}
