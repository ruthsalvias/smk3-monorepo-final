import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Icon from "../../../components/Icon";
import { AdminCard, AdminTable, AdminModal, ActionButtons } from "../components/AdminComponents";
import {
  getStatistik,
  postStatistik,
  putStatistik,
  deleteStatistik,
} from "../../profil/api/pengaturanApi";
import { useSiteSettings } from "../../profil/context/SiteSettingsContext";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const ICON_OPTIONS = [
  "students",
  "teacher",
  "trophy",
  "handshake",
  "graduation",
  "building",
  "book",
  "briefcase",
  "users",
  "star",
  "shield",
  "chart",
];

const EMPTY = { label: "", nilai: "", ikon: "students", urutan: 0 };

export default function AdminStatistikPage() {
  const { refresh } = useSiteSettings();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getStatistik());
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY, urutan: items.length + 1 });
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      label: item.label || "",
      nilai: item.nilai || "",
      ikon: item.ikon || "students",
      urutan: Number(item.urutan) || 0,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.label.trim() || !form.nilai.trim()) {
      showErrorDialog("Label dan nilai wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        label: form.label.trim(),
        nilai: form.nilai.trim(),
        ikon: form.ikon,
        urutan: Number(form.urutan) || 0,
      };
      if (editId) await putStatistik(editId, payload);
      else await postStatistik(payload);
      setOpen(false);
      await load();
      await refresh();
      showSuccessDialog(editId ? "Statistik berhasil diperbarui" : "Statistik berhasil ditambahkan");
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const result = await showConfirmDialog(`Hapus statistik "${item.label}"?`);
    if (!result.isConfirmed) return;
    try {
      await deleteStatistik(item.id);
      await load();
      await refresh();
      showSuccessDialog("Statistik berhasil dihapus");
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  return (
    <AdminLayout
      title="Statistik Sekolah"
      subtitle="Angka capaian yang ditampilkan pada bagian sorotan halaman beranda."
    >
      <AdminCard
        title="Daftar Statistik"
        subtitle={`${items.length} item aktif`}
        onAdd={openCreate}
        addLabel="Tambah Statistik"
      >
        <AdminTable
          columns={["Ikon", "Label", "Nilai", "Urutan", "Aksi"]}
          loading={loading}
          empty={!loading && items.length === 0}
        >
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <span className="smk-stat-icon-cell">
                  <Icon name={item.ikon} size={20} />
                </span>
              </td>
              <td>
                <strong>{item.label}</strong>
              </td>
              <td>{item.nilai}</td>
              <td>{item.urutan}</td>
              <td>
                <ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} />
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Statistik" : "Tambah Statistik"}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        <div className="smk-form-group">
          <label htmlFor="stat-label">Label</label>
          <input
            id="stat-label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Siswa Aktif"
          />
        </div>
        <div className="smk-form-row">
          <div className="smk-form-group">
            <label htmlFor="stat-nilai">Nilai</label>
            <input
              id="stat-nilai"
              value={form.nilai}
              onChange={(e) => setForm({ ...form, nilai: e.target.value })}
              placeholder="1.200+"
            />
          </div>
          <div className="smk-form-group">
            <label htmlFor="stat-urutan">Urutan</label>
            <input
              id="stat-urutan"
              type="number"
              min={0}
              value={form.urutan}
              onChange={(e) => setForm({ ...form, urutan: e.target.value })}
            />
          </div>
        </div>
        <div className="smk-form-group">
          <label>Ikon</label>
          <div className="smk-icon-picker">
            {ICON_OPTIONS.map((name) => (
              <button
                type="button"
                key={name}
                className={`smk-icon-option${form.ikon === name ? " active" : ""}`}
                onClick={() => setForm({ ...form, ikon: name })}
                aria-label={name}
              >
                <Icon name={name} size={20} />
              </button>
            ))}
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
