import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import { asyncGetGuru, asyncPutGuru } from "../states/action";
import AdminLayout from "../../admin/layouts/AdminLayout.jsx";
import "../resources/manajemen.css";

export default function EditGuruPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // Ambil data dari store
  const guruList = useSelector((s) => s.guru);
  const guru = guruList.find((g) => String(g.id) === String(id));

  const [form, setForm] = useState({
    namaLengkap: "",
    nip: "",
    noTelepon: "",
    anakWali: "",
    mataPelajaran: "",
    alamat: "",
    jabatan: "",
  });

  const [editing, setEditing] = useState({});

  // Load jika kosong
  useEffect(() => {
    if (guruList.length === 0) {
      dispatch(asyncGetGuru());
    }
  }, [dispatch, guruList.length]);

  // Sync data ke form
  useEffect(() => {
    if (guru) {
      setForm({
        namaLengkap: guru.namaLengkap || "",
        nip: guru.nip || "",
        noTelepon: guru.noTelepon || "",
        anakWali: guru.anakWali || "",
        mataPelajaran: guru.mataPelajaran || "",
        alamat: guru.alamat || "",
        jabatan: guru.jabatan || "",
      });
    }
  }, [guru]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFieldSave = (field) => {
    setEditing((prev) => ({ ...prev, [field]: false }));
    dispatch(asyncPutGuru(id, form));
  };

  const fields = [
    { key: "namaLengkap", label: "Nama Lengkap" },
    { key: "nip", label: "NIP" },
    { key: "noTelepon", label: "No Telepon" },
    { key: "mataPelajaran", label: "Mata Pelajaran" },
    { key: "jabatan", label: "Jabatan", type: "select", options: ["guru", "kepala_sekolah", "wakil"] },
    { key: "anakWali", label: "Anak Wali" },
    { key: "alamat", label: "Alamat" },
  ];

  // Loading
  if (!guru) {
    return (
      <AdminLayout>
        <section className="smk-section smk-bg-cream">
          <div className="smk-header-area">
            <p style={{ color: "#6b7280", fontSize: 15 }}>Memuat data guru...</p>
          </div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <section className="smk-section smk-bg-cream">

        {/* HEADER */}
        <div className="smk-header-area">

          <h1 className="edit-siswa-title">
            {guru.nip} – {guru.namaLengkap}
          </h1>
        </div>

        {/* CARD */}
        <div className="smk-container edit-card">
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
          <h2 className="edit-card-title">Data Guru</h2>

          <div className="edit-fields-list">
            {fields.map(({ key, label, type, options }) => (
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
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        onBlur={() => handleFieldSave(key)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleFieldSave(key)
                        }
                        className="edit-field-input"
                        autoFocus
                      />
                    )}
                  </>
                ) : (
                  <div className="edit-field-display">
                    <span className="edit-field-label">{label}</span>
                    <span className="edit-field-value">
                      {form[key] || "—"}
                    </span>
                  </div>
                )}

                {/* BUTTON EDIT / SAVE */}
                <button
                  className={`edit-field-btn ${
                    editing[key] ? "active" : ""
                  }`}
                  onClick={() =>
                    editing[key]
                      ? handleFieldSave(key)
                      : toggleEdit(key)
                  }
                  title={editing[key] ? "Simpan" : "Edit"}
                >
                  {editing[key] ? (
                    // CHECK ICON
                    <svg width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    // EDIT ICON
                    <svg width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  )}
                </button>

              </div>
            ))}
          </div>

          {/* ── ACTION BUTTONS ── */}
            <div className="form-actions">
              <button 
                type="button"
                onClick={() => navigate(adminPath("/data/guru"))}
                className="btn-cancel"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => navigate(adminPath("/data/guru"))}
                className="btn-success"
              >
                Selesai
              </button>
            </div>

          <div style={{ borderTop: "1px solid #e5e7eb", margin: "32px 0" }} />
        </div>

      </section>
    </AdminLayout>
  );
}