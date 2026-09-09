import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import { asyncPostGuru } from "../states/action";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import Icon from "../../../components/Icon";
import "../resources/manajemen.css";

export default function AddGuruPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    namaLengkap: "",
    nip: "",
    noTelepon: "",
    anakWali: "",
    mataPelajaran: "",
    alamat: "",
    jabatan: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(asyncPostGuru(form));
      navigate(adminPath("/data/guru"));
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [showCustomJabatan, setShowCustomJabatan] = useState(false);

  return (
    <AdminLayout>
      <section className="smk-section smk-bg-cream">

        {/* HEADER */}
        <div className="smk-header-area">
          <h1 className="smk-section-title">
            Tambah <span className="text-primary">Guru Baru</span>
          </h1>
          <p className="smk-section-subtitle">
            Isi semua data guru dengan lengkap dan benar
          </p>
        </div>

        {/* FORM */}
        <div className="smk-manajemen-container">
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
          <form onSubmit={handleSubmit}>

            {/* ── IDENTITAS GURU ── */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon"><Icon name="teacher" size={20} /></div>
                <div>
                  <h2 className="form-section-title">Identitas Guru</h2>
                  <p className="form-section-desc">Data pribadi guru</p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-field col-span-2">
                  <label className="form-label">
                    Nama Lengkap <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="namaLengkap"
                    placeholder="Masukkan nama lengkap"
                    value={form.namaLengkap}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    NIP <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="nip"
                    placeholder="Nomor Induk Pegawai"
                    value={form.nip}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">No Telepon</label>
                  <input
                    type="text"
                    name="noTelepon"
                    placeholder="Contoh: 08123456789"
                    value={form.noTelepon}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Mata Pelajaran</label>
                  <input
                    type="text"
                    name="mataPelajaran"
                    placeholder="Contoh: Kecantikan"
                    value={form.mataPelajaran}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Jabatan</label>
                  <select
                    name="jabatan"
                    value={showCustomJabatan ? "custom" : form.jabatan}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setShowCustomJabatan(true);
                        setForm({ ...form, jabatan: "" });
                      } else {
                        setShowCustomJabatan(false);
                        setForm({ ...form, jabatan: e.target.value });
                      }
                    }}
                    className="form-input form-select"
                  >
                    <option value="">Pilih jabatan</option>
                    <option value="guru">Guru</option>
                    <option value="kepala_sekolah">Kepala Sekolah</option>
                    <option value="wakil">Wakil Kepala Sekolah</option>
                    <option value="custom">Lainnya (isi manual)</option>
                  </select>

                  {showCustomJabatan && (
                    <input
                      type="text"
                      name="jabatan"
                      placeholder="Masukkan jabatan"
                      value={form.jabatan}
                      onChange={handleChange}
                      className="form-input"
                      style={{ marginTop: "8px" }}
                    />
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Anak Wali</label>
                  <input
                    type="text"
                    name="anakWali"
                    placeholder="Kelas yang menjadi anak wali (jika wali kelas)"
                    value={form.anakWali}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-field col-span-2">
                  <label className="form-label">Alamat</label>
                  <textarea
                    name="alamat"
                    placeholder="Masukkan alamat lengkap"
                    value={form.alamat}
                    onChange={handleChange}
                    className="form-input form-textarea"
                    rows={3}
                  />
                </div>

              </div>
            </div>

            {/* ACTION */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(adminPath("/data/guru"))}
                className="btn-cancel"
              >
                Batal
              </button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Guru"}
              </button>
            </div>

          </form>
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />
        </div>

      </section>
    </AdminLayout>
  );
}