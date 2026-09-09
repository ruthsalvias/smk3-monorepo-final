import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import { asyncGetSiswa, asyncPutSiswa } from "../states/action";
import manajemenApi from "../api/manajemenApi.js";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import "../resources/manajemen.css";

export default function EditSiswaPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // Ambil dari array siswa yang sudah ada di store
  const siswaList = useSelector((s) => s.siswa);
  const siswa = siswaList.find((s) => String(s.id) === String(id));
  const [uploaded, setUploaded] = useState({});

  const [form, setForm] = useState({
    namaLengkap: "",
    jurusan: "",
    nisn: "",
    nis: "",
    kelas: "",
    tanggalLahir: "",
    alamat: "",
    noWaOrtu: "",
    status: "",
    raporFile: "",
    sklFile: "",
    ijazahFile: "",
  });

  const [editing, setEditing] = useState({});

  // Load siswa kalau belum ada di store
  useEffect(() => {
    if (siswaList.length === 0) {
      dispatch(asyncGetSiswa());
    }
  }, [dispatch, siswaList.length]);

  // Sync form saat data siswa ketemu
  useEffect(() => {
    if (siswa) {
      setForm({
        namaLengkap:  siswa.namaLengkap  || "",
        jurusan:      siswa.jurusan      || "",
        nisn:         siswa.nisn         || "",
        nis:          siswa.nis          || "",
        kelas:        siswa.kelas        || "",
        tanggalLahir: siswa.tanggalLahir || "",
        alamat:       siswa.alamat       || "",
        noWaOrtu:     siswa.noWaOrtu     || "",
        status:       siswa.status       || "",
        raporFile:    siswa.raporFile    || "",
        sklFile:      siswa.sklFile      || "",
        ijazahFile:   siswa.ijazahFile   || "",
      });
    }
  }, [siswa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFieldSave = (field) => {
    setEditing((prev) => ({ ...prev, [field]: false }));
    // Kirim seluruh form agar field lain tidak terhapus
    dispatch(asyncPutSiswa(id, form));
  };

  const handleUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan");
      e.target.value = "";
      return;
    }

    const typeMap = { raporFile: "rapor", sklFile: "skl", ijazahFile: "ijazah" };
    const type = typeMap[field];

    try {
      const result = await manajemenApi.uploadSiswaFile(id, type, file);

      setForm((prev) => ({ ...prev, [field]: result.path }));

      // tandai sukses
      setUploaded((prev) => ({ ...prev, [field]: true }));

      // opsional: hilangkan centang setelah beberapa detik
      setTimeout(() => {
        setUploaded((prev) => ({ ...prev, [field]: false }));
      }, 2000);

    } catch (err) {
      alert("Upload gagal: " + err.message);
    }
  };

  const handleDownload = (field) => {
    const typeMap = {
      raporFile: "rapor",
      sklFile: "skl",
      ijazahFile: "ijazah",
    };

    const type = typeMap[field];

    try {
      manajemenApi.downloadFileSiswa(id, type);
    } catch (err) {
      alert("Gagal download: " + err.message);
    }
  };

  const identitasFields = [
    { key: "namaLengkap",  label: "Nama Lengkap" },
    { key: "nisn",         label: "NISN" },
    { key: "nis",          label: "NIS" },
    { key: "jurusan",      label: "Jurusan" },
    { key: "kelas",        label: "Kelas" },
    { key: "tanggalLahir", label: "Tanggal Lahir", type: "date" },
    { key: "alamat",       label: "Alamat" },
    { key: "noWaOrtu",     label: "No WA Orang Tua" },
    { key: "status",       label: "Status", type: "select", options: ["aktif", "lulus", "nonaktif"] },
  ];

  const dokumenFields = [
    { key: "raporFile",  label: "Rapor" },
    { key: "sklFile",    label: "SKL" },
    { key: "ijazahFile", label: "Ijazah" },
  ];

  // Loading state
  if (!siswa) {
    return (
      <AdminLayout>
        <section className="smk-section smk-bg-cream">
          <div className="smk-header-area">
            <p style={{ color: "#6b7280", fontSize: 15 }}>Memuat data siswa...</p>
          </div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <section className="smk-section smk-bg-cream">

        <div className="smk-header-area">
          <h1 className="edit-siswa-title">
            {siswa.nisn} – {siswa.namaLengkap}
          </h1>
        </div>

        {/* ── CARD IDENTITAS ── */}
        <div className="smk-container edit-card">
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
          <h2 className="edit-card-title">Identitas Siswa</h2>

          <div className="edit-fields-list">
            {identitasFields.map(({ key, label, type, options }) => (
              <div key={key} className="edit-field-row">
                {editing[key] ? (
                  <>
                    {type === "select" ? (
                      <select
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        onBlur={() => handleFieldSave(key)}
                        className="edit-field-input"
                        autoFocus
                      >
                        {options.map((o) => (
                          <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type || "text"}
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        onBlur={() => handleFieldSave(key)}
                        onKeyDown={(e) => e.key === "Enter" && handleFieldSave(key)}
                        className="edit-field-input"
                        autoFocus
                      />
                    )}
                  </>
                ) : (
                  <div className="edit-field-display">
                    <span className="edit-field-label">{label}</span>
                    <span className="edit-field-value">{form[key] || "—"}</span>
                  </div>
                )}
                <button
                  className={`edit-field-btn ${editing[key] ? "active" : ""}`}
                  onClick={() => editing[key] ? handleFieldSave(key) : toggleEdit(key)}
                  title={editing[key] ? "Simpan" : "Edit"}
                >
                  {editing[key] ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
        </div>

        {/* ── CARD DOKUMEN ── */}
        <div className="smk-container edit-card">
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
          <h2 className="edit-card-title">Unduh File Siswa</h2>

          <div className="edit-dokumen-list">
            {dokumenFields.map(({ key, label }) => (
              <div key={key} className="edit-dokumen-row">
                <div className="edit-dokumen-name">{label}</div>
                <div className="edit-dokumen-actions">
                  <label className="edit-file-btn" title="Upload file">
                    <input
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) => handleUpload(key, e)}
                    />

                    {uploaded[key] ? (
                      // ICON CENTANG
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="green"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      // ICON UPLOAD
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="16 16 12 12 8 16" />
                        <line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                      </svg>
                    )}
                  </label>
                  <button
                    className="edit-file-btn"
                    title="Download file"
                    onClick={() => handleDownload(key)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="8 17 12 21 16 17" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.09" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
        </div>

        <div className="smk-container edit-card">
          {/* ── ACTION BUTTONS ── */}
            <div className="form-actions">
              <button 
                type="button"
                onClick={() => navigate(adminPath("/data/siswa"))}
                className="btn-cancel"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => navigate(adminPath("/data/siswa"))}
                className="btn-success"
              >
                Selesai
              </button>
            </div>

          <div style={{ borderTop: "1px solid #e5e7eb", margin: "8px 0" }} />
        </div>

      </section>
    </AdminLayout>
  );
}
