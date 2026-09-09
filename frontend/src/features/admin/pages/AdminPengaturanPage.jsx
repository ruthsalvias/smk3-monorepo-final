import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Icon from "../../../components/Icon";
import { mediaUrl } from "../components/AdminComponents";
import { getPengaturan, putPengaturan } from "../../profil/api/pengaturanApi";
import { useSiteSettings } from "../../profil/context/SiteSettingsContext";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "X / Twitter" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "globe", label: "Website Lain" },
];

const EMPTY = {
  nama_sekolah: "",
  nama_singkat: "",
  tagline: "",
  deskripsi_singkat: "",
  tahun_ajaran: "",
  alamat: "",
  telepon: "",
  email: "",
  jam_operasional: "",
};

export default function AdminPengaturanPage() {
  const { refresh } = useSiteSettings();
  const [form, setForm] = useState(EMPTY);
  const [sosial, setSosial] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getPengaturan();
        if (!alive) return;
        setForm({
          nama_sekolah: data.nama_sekolah || "",
          nama_singkat: data.nama_singkat || "",
          tagline: data.tagline || "",
          deskripsi_singkat: data.deskripsi_singkat || "",
          tahun_ajaran: data.tahun_ajaran || "",
          alamat: data.alamat || "",
          telepon: data.telepon || "",
          email: data.email || "",
          jam_operasional: data.jam_operasional || "",
        });
        setSosial(Array.isArray(data.sosial_media) ? data.sosial_media : []);
        setLogoPreview(mediaUrl(data.logo_url));
      } catch (err) {
        showErrorDialog(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onLogo = (file) => {
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const addSosial = () => setSosial((prev) => [...prev, { platform: "facebook", url: "" }]);
  const updateSosial = (index, key, value) =>
    setSosial((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  const removeSosial = (index) => setSosial((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_sekolah.trim()) {
      showErrorDialog("Nama sekolah wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const cleanSosial = sosial
        .filter((s) => s.platform && s.url.trim())
        .map((s) => ({ platform: s.platform, url: s.url.trim() }));
      await putPengaturan({ ...form, sosial_media: cleanSosial }, logoFile);
      setLogoFile(null);
      await refresh();
      showSuccessDialog("Pengaturan sekolah berhasil disimpan");
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Pengaturan Sekolah"
      subtitle="Identitas, kontak, jam operasional, dan media sosial yang tampil di seluruh website."
    >
      {loading ? (
        <div className="smk-admin-card">
          <div className="smk-admin-card-body smk-admin-table-state">
            <span className="smk-admin-spinner" /> Memuat pengaturan...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="smk-settings-grid">
          {/* IDENTITAS */}
          <section className="smk-admin-card">
            <div className="smk-admin-card-header">
              <div>
                <div className="smk-admin-card-title">
                  <Icon name="shield" size={18} /> Identitas Sekolah
                </div>
                <div className="smk-admin-card-sub">Nama, tagline, dan logo resmi.</div>
              </div>
            </div>
            <div className="smk-admin-card-body">
              <div className="smk-form-row">
                <div className="smk-form-group">
                  <label htmlFor="nama_sekolah">Nama Sekolah</label>
                  <input
                    id="nama_sekolah"
                    value={form.nama_sekolah}
                    onChange={onChange("nama_sekolah")}
                    placeholder="SMK NEGERI 3 BALIGE"
                  />
                </div>
                <div className="smk-form-group">
                  <label htmlFor="nama_singkat">Nama Singkat</label>
                  <input
                    id="nama_singkat"
                    value={form.nama_singkat}
                    onChange={onChange("nama_singkat")}
                    placeholder="SMKN 3 Balige"
                  />
                </div>
              </div>

              <div className="smk-form-row">
                <div className="smk-form-group">
                  <label htmlFor="tagline">Tagline</label>
                  <input
                    id="tagline"
                    value={form.tagline}
                    onChange={onChange("tagline")}
                    placeholder="Excellence in Education"
                  />
                </div>
                <div className="smk-form-group">
                  <label htmlFor="tahun_ajaran">Tahun Ajaran</label>
                  <input
                    id="tahun_ajaran"
                    value={form.tahun_ajaran}
                    onChange={onChange("tahun_ajaran")}
                    placeholder="2025/2026"
                  />
                </div>
              </div>

              <div className="smk-form-group">
                <label htmlFor="deskripsi_singkat">Deskripsi Singkat</label>
                <textarea
                  id="deskripsi_singkat"
                  rows={3}
                  value={form.deskripsi_singkat}
                  onChange={onChange("deskripsi_singkat")}
                  placeholder="Kalimat singkat tentang sekolah, tampil di footer dan beranda."
                />
              </div>

              <div className="smk-form-group">
                <label>Logo Sekolah</label>
                <div className="smk-logo-picker">
                  <div className="smk-logo-preview">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo sekolah" />
                    ) : (
                      <Icon name="image" size={26} />
                    )}
                  </div>
                  <label htmlFor="logo-input" className="smk-btn-outline">
                    <Icon name="upload" size={16} /> Pilih Logo
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => onLogo(e.target.files?.[0])}
                    />
                  </label>
                </div>
                <small className="smk-form-hint">PNG / JPG / WEBP, maksimal 5MB.</small>
              </div>
            </div>
          </section>

          {/* KONTAK */}
          <section className="smk-admin-card">
            <div className="smk-admin-card-header">
              <div>
                <div className="smk-admin-card-title">
                  <Icon name="mapPin" size={18} /> Kontak & Jam Operasional
                </div>
                <div className="smk-admin-card-sub">
                  Tulis satu item per baris untuk telepon, email, dan jam operasional.
                </div>
              </div>
            </div>
            <div className="smk-admin-card-body">
              <div className="smk-form-group">
                <label htmlFor="alamat">Alamat</label>
                <textarea
                  id="alamat"
                  rows={2}
                  value={form.alamat}
                  onChange={onChange("alamat")}
                  placeholder="Jl. Pendidikan No. 123, Balige"
                />
              </div>
              <div className="smk-form-row">
                <div className="smk-form-group">
                  <label htmlFor="telepon">Telepon</label>
                  <textarea
                    id="telepon"
                    rows={3}
                    value={form.telepon}
                    onChange={onChange("telepon")}
                    placeholder={"(021) 1234-5678\n+62 812-3456-7890"}
                  />
                </div>
                <div className="smk-form-group">
                  <label htmlFor="email">Email</label>
                  <textarea
                    id="email"
                    rows={3}
                    value={form.email}
                    onChange={onChange("email")}
                    placeholder={"info@sekolah.sch.id\nadmin@sekolah.sch.id"}
                  />
                </div>
              </div>
              <div className="smk-form-group">
                <label htmlFor="jam_operasional">Jam Operasional</label>
                <textarea
                  id="jam_operasional"
                  rows={3}
                  value={form.jam_operasional}
                  onChange={onChange("jam_operasional")}
                  placeholder={"Senin - Jumat: 07:00 - 15:00\nSabtu: 07:00 - 12:00"}
                />
              </div>
            </div>
          </section>

          {/* SOSIAL MEDIA */}
          <section className="smk-admin-card smk-settings-full">
            <div className="smk-admin-card-header">
              <div>
                <div className="smk-admin-card-title">
                  <Icon name="globe" size={18} /> Media Sosial
                </div>
                <div className="smk-admin-card-sub">Tautan yang muncul di footer website.</div>
              </div>
              <button type="button" className="smk-btn-primary smk-admin-btn-sm" onClick={addSosial}>
                <Icon name="plus" size={15} /> Tambah
              </button>
            </div>
            <div className="smk-admin-card-body">
              {sosial.length === 0 ? (
                <p className="smk-admin-empty-inline">Belum ada tautan media sosial.</p>
              ) : (
                <div className="smk-repeater">
                  {sosial.map((item, index) => (
                    <div className="smk-repeater-row" key={index}>
                      <span className="smk-repeater-icon">
                        <Icon name={item.platform || "globe"} size={18} />
                      </span>
                      <select
                        value={item.platform}
                        onChange={(e) => updateSosial(index, "platform", e.target.value)}
                        aria-label="Platform"
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={item.url}
                        onChange={(e) => updateSosial(index, "url", e.target.value)}
                        placeholder="https://..."
                        aria-label="URL"
                      />
                      <button
                        type="button"
                        className="smk-admin-btn-delete"
                        onClick={() => removeSosial(index)}
                        aria-label="Hapus"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="smk-settings-actions smk-settings-full">
            <button type="submit" className="smk-btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="smk-admin-spinner smk-admin-spinner-sm" /> Menyimpan...
                </>
              ) : (
                <>
                  <Icon name="shield" size={16} /> Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
