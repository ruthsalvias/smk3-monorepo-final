// src/features/admin/pages/AdminBeritaPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../layouts/AdminLayout";
import {
  AdminCard, AdminTable, AdminModal,
  AdminThumb, ActionButtons, UploadArea, beritaMediaUrl,
} from "../components/AdminComponents";
import { showConfirmDialog, showErrorDialog } from "../../../helpers/toolsHelper";
import useInput from "../../../hooks/useInput";
import {
  asyncGetBerita,    asyncPostBerita,    asyncPutBerita,    asyncDeleteBerita,
  asyncTogglePinBerita,
  asyncGetAgenda,    asyncPostAgenda,    asyncPutAgenda,    asyncDeleteAgenda,
  asyncGetPengumuman, asyncPostPengumuman, asyncPutPengumuman, asyncDeletePengumuman,
  asyncTogglePinPengumuman,
} from "../../berita/states/action";
import { AGENDA_CATEGORIES, PENGUMUMAN_TYPES } from "../../berita/api/beritaApi";
import Icon from "../../../components/Icon";
import RichTextEditor from "../../../components/RichTextEditor";

// Isi berita/pengumuman kini berupa HTML, jadi cuplikan tabel dibersihkan dulu.
const plainText = (html, max = 80) => {
  const text = String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const formatWaktu = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const LABEL_TIPE_PENGUMUMAN = {
  biasa: "Biasa",
  penting: "Penting",
  sangat_penting: "Sangat Penting",
  mendesak: "Mendesak",
};

// ─────────────────────────────────────────────────────────────
// BERITA
// ─────────────────────────────────────────────────────────────
export function AdminBeritaPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.berita   || []);
  const loading  = useSelector((s) => s.beritaLoading);

  const [modalOpen, setModalOpen]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [file, setFile]               = useState(null);
  const [preview, setPreview]         = useState(null);
  const [title, setTitle]             = useInput("");
  const [content, setContent]         = useInput("");
  const [description, setDescription] = useInput("");

  useEffect(() => { dispatch(asyncGetBerita()); }, [dispatch]);

  const resetForm = () => {
    setTitle({ target: { value: "" } });
    setContent({ target: { value: "" } });
    setDescription({ target: { value: "" } });
    setFile(null);
    setPreview(null);
  };

  const openAdd = () => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setTitle({ target: { value: item.title ?? "" } });
    setContent({ target: { value: item.content ?? "" } });
    setDescription({ target: { value: item.description ?? "" } });
    setFile(null);
    // ✅ Fix: BE mengembalikan field "imageUrl", bukan "gambar"
    setPreview(item.imageUrl ? beritaMediaUrl(item.imageUrl) : null);
    setModalOpen(true);
  };

  const handleFile = (f) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleClose = () => {
    // Bersihkan blob URL agar tidak memory leak
    if (file && preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setModalOpen(false);
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = () => {
    // ✅ Validasi FE — pesan error dalam Bahasa Indonesia
    if (!title.trim() || title.trim().length < 5) {
      showErrorDialog("Judul berita minimal 5 karakter");
      return;
    }
    if (content.trim() && content.trim().length < 10) {
      showErrorDialog("Isi berita minimal 10 karakter jika diisi");
      return;
    }

    setSubmitting(true);
    const cb = () => {
      if (file && preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setModalOpen(false);
      setSubmitting(false);
      setFile(null);
      setPreview(null);
    };
    if (editItem)
      dispatch(asyncPutBerita(editItem.id, title, content, description, file, cb));
    else
      dispatch(asyncPostBerita(title, content, description, file, cb));
    setTimeout(() => setSubmitting(false), 5000);
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus berita "${item.title}"?`);
    if (r.isConfirmed) dispatch(asyncDeleteBerita(item.id));
  };

  return (
    <AdminLayout title="Berita">
      <AdminCard title="Berita & Informasi" subtitle="Kelola data berita sekolah" onAdd={openAdd}>
        <AdminTable
          columns={["Gambar", "Judul", "Deskripsi", "Dibuat", "Aksi"]}
          loading={loading}
          empty={!data.length}
        >
          {data.map((item) => (
            <tr key={item.id}>
              {/* ✅ Fix: pakai item.imageUrl sesuai response dari BE */}
              <td><AdminThumb src={beritaMediaUrl(item.imageUrl)} fallback={<Icon name="news" size={18} />} /></td>
              <td>
                <strong>{item.title}</strong>
                {item.isPinned && <span className="smk-admin-pin-tag"><Icon name="pin" size={12} /> Tersemat</span>}
              </td>
              <td className="smk-admin-td-truncate">{item.description?.slice(0, 80)}</td>
              <td className="smk-admin-td-nowrap">{formatWaktu(item.createdAt)}</td>
              <td>
                <ActionButtons
                  onEdit={() => openEdit(item)}
                  onDelete={() => handleDelete(item)}
                  onPin={() => dispatch(asyncTogglePinBerita(item.id))}
                  pinned={!!item.isPinned}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal
        open={modalOpen}
        onClose={handleClose}
        title={editItem ? "Edit Berita" : "Tambah Berita"}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        <div className="smk-form-group">
          <label>Judul Berita <span style={{ color: "red" }}>*</span></label>
          <input
            className="smk-form-input" type="text"
            value={title} onChange={setTitle}
            placeholder="contoh: Siswa SMK N3 Balige Raih Juara Nasional"
          />
        </div>
        <div className="smk-form-group">
          <label>Deskripsi Singkat</label>
          <input
            className="smk-form-input" type="text"
            value={description} onChange={setDescription}
            placeholder="Ringkasan singkat berita..."
          />
        </div>
        <div className="smk-form-group">
          <label>Isi Berita <span style={{ color: "red" }}>*</span></label>
          <RichTextEditor
            value={content}
            onChange={(html) => setContent({ target: { value: html } })}
            placeholder="Tulis isi berita lengkap di sini..."
          />
        </div>
        <UploadArea
          id="beritaGambar"
          onFile={handleFile}
          preview={preview}
          label="Pilih gambar berita (opsional)"
        />
      </AdminModal>
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// AGENDA
// ─────────────────────────────────────────────────────────────
export function AdminAgendaPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.agenda   || []);
  const loading  = useSelector((s) => s.beritaLoading);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [title, setTitle]           = useInput("");
  const [date, setDate]             = useInput("");
  const [location, setLocation]     = useInput("");
  const [description, setDescription] = useInput("");
  const [startTime, setStartTime]   = useInput("");
  const [endTime, setEndTime]       = useInput("");
  const [category, setCategory]     = useInput("kegiatan");
  const [participants, setParticipants] = useInput("");

  useEffect(() => { dispatch(asyncGetAgenda()); }, [dispatch]);

  const fill = (item) => {
    setTitle({ target: { value: item?.title ?? "" } });
    setDate({ target: { value: (item?.date || "").slice(0, 10) } });
    setLocation({ target: { value: item?.location ?? "" } });
    setDescription({ target: { value: item?.description ?? "" } });
    setStartTime({ target: { value: (item?.startTime || "").slice(0, 5) } });
    setEndTime({ target: { value: (item?.endTime || "").slice(0, 5) } });
    setCategory({ target: { value: item?.category ?? "kegiatan" } });
    setParticipants({ target: { value: item?.participants ?? "" } });
    setFile(null);
    setPreview(item?.imageUrl ? beritaMediaUrl(item.imageUrl) : null);
  };

  const openAdd = () => {
    setEditItem(null);
    fill(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    fill(item);
    setModalOpen(true);
  };

  const handleFile = (f) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleClose = () => {
    if (file && preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setModalOpen(false);
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = () => {
    if (!title.trim()) { showErrorDialog("Judul kegiatan wajib diisi"); return; }
    if (!date) { showErrorDialog("Tanggal kegiatan wajib diisi"); return; }

    const payload = {
      title: title.trim(),
      date,
      location: location.trim(),
      description: description.trim(),
      startTime,
      endTime,
      category,
      participants: participants.trim(),
    };

    setSubmitting(true);
    const cb = () => {
      if (file && preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setModalOpen(false);
      setSubmitting(false);
      setFile(null);
      setPreview(null);
    };
    if (editItem) dispatch(asyncPutAgenda(editItem.id, payload, file, cb));
    else          dispatch(asyncPostAgenda(payload, file, cb));
    setTimeout(() => setSubmitting(false), 5000);
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus agenda "${item.title}"?`);
    if (r.isConfirmed) dispatch(asyncDeleteAgenda(item.id));
  };

  return (
    <AdminLayout title="Agenda">
      <AdminCard title="Agenda Sekolah" subtitle="Kelola jadwal kegiatan sekolah" onAdd={openAdd}>
        <AdminTable
          columns={["Gambar", "Judul", "Tanggal", "Waktu", "Lokasi", "Kategori", "Aksi"]}
          loading={loading}
          empty={!data.length}
        >
          {data.map((item) => (
            <tr key={item.id}>
              <td><AdminThumb src={beritaMediaUrl(item.imageUrl)} fallback={<Icon name="calendar" size={18} />} /></td>
              <td><strong>{item.title}</strong></td>
              <td>{item.date}</td>
              <td>
                {item.startTime
                  ? `${item.startTime.slice(0, 5)}${item.endTime ? ` - ${item.endTime.slice(0, 5)}` : ""}`
                  : "-"}
              </td>
              <td>{item.location || "-"}</td>
              <td>{item.category || "-"}</td>
              <td>
                <ActionButtons
                  onEdit={() => openEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal
        open={modalOpen}
        onClose={handleClose}
        title={editItem ? "Edit Agenda" : "Tambah Agenda"}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        <div className="smk-form-group">
          <label>Judul Kegiatan <span style={{ color: "red" }}>*</span></label>
          <input
            className="smk-form-input" type="text"
            value={title} onChange={setTitle}
            placeholder="contoh: Upacara Hari Pendidikan Nasional"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="smk-form-group">
            <label>Tanggal <span style={{ color: "red" }}>*</span></label>
            <input className="smk-form-input" type="date" value={date} onChange={setDate} />
          </div>
          <div className="smk-form-group">
            <label>Kategori</label>
            <select className="smk-form-input" value={category} onChange={setCategory}>
              {AGENDA_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="smk-form-group">
            <label>Jam Mulai (opsional)</label>
            <input className="smk-form-input" type="time" value={startTime} onChange={setStartTime} />
          </div>
          <div className="smk-form-group">
            <label>Jam Selesai (opsional)</label>
            <input className="smk-form-input" type="time" value={endTime} onChange={setEndTime} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="smk-form-group">
            <label>Lokasi (opsional)</label>
            <input
              className="smk-form-input" type="text"
              value={location} onChange={setLocation}
              placeholder="contoh: Lapangan Sekolah"
            />
          </div>
          <div className="smk-form-group">
            <label>Peserta (opsional)</label>
            <input
              className="smk-form-input" type="text"
              value={participants} onChange={setParticipants}
              placeholder="contoh: Seluruh siswa kelas X"
            />
          </div>
        </div>
        <div className="smk-form-group">
          <label>Deskripsi (opsional)</label>
          <textarea
            className="smk-form-input" rows={4}
            value={description} onChange={setDescription}
            placeholder="Penjelasan singkat kegiatan..."
          />
        </div>
        <UploadArea
          id="agendaGambar"
          onFile={handleFile}
          preview={preview}
          label="Pilih gambar agenda (opsional)"
        />
      </AdminModal>
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// PENGUMUMAN
// ─────────────────────────────────────────────────────────────
export function AdminPengumumanPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.pengumuman || []);
  const loading  = useSelector((s) => s.beritaLoading);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [title, setTitle]           = useInput("");
  const [content, setContent]       = useInput("");
  const [description, setDescription] = useInput("");
  const [type, setType]             = useInput("biasa");
  const [expiredAt, setExpiredAt]   = useInput("");

  useEffect(() => { dispatch(asyncGetPengumuman()); }, [dispatch]);

  const fill = (item) => {
    setTitle({ target: { value: item?.title ?? "" } });
    setContent({ target: { value: item?.content ?? "" } });
    setDescription({ target: { value: item?.description ?? "" } });
    setType({ target: { value: item?.type ?? "biasa" } });
    setExpiredAt({ target: { value: (item?.expiredAt || "").slice(0, 10) } });
    setFile(null);
    setPreview(item?.imageUrl ? beritaMediaUrl(item.imageUrl) : null);
  };

  const openAdd = () => {
    setEditItem(null);
    fill(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    fill(item);
    setModalOpen(true);
  };

  const handleFile = (f) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleClose = () => {
    if (file && preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setModalOpen(false);
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = () => {
    if (title.trim().length < 3) { showErrorDialog("Judul pengumuman minimal 3 karakter"); return; }
    if (content.trim().length < 3) { showErrorDialog("Isi pengumuman minimal 3 karakter"); return; }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      description: description.trim(),
      type,
      author: "Admin",
      expiredAt,
    };

    setSubmitting(true);
    const cb = () => {
      if (file && preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setModalOpen(false);
      setSubmitting(false);
      setFile(null);
      setPreview(null);
    };
    if (editItem) dispatch(asyncPutPengumuman(editItem.id, payload, file, cb));
    else          dispatch(asyncPostPengumuman(payload, file, cb));
    setTimeout(() => setSubmitting(false), 5000);
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus pengumuman "${item.title}"?`);
    if (r.isConfirmed) dispatch(asyncDeletePengumuman(item.id));
  };

  return (
    <AdminLayout title="Pengumuman">
      <AdminCard title="Pengumuman" subtitle="Kelola pengumuman sekolah" onAdd={openAdd}>
        <AdminTable
          columns={["Gambar", "Judul", "Tipe", "Isi", "Berlaku Sampai", "Aksi"]}
          loading={loading}
          empty={!data.length}
        >
          {data.map((item) => (
            <tr key={item.id}>
              <td><AdminThumb src={beritaMediaUrl(item.imageUrl)} fallback={<Icon name="megaphone" size={18} />} /></td>
              <td>
                <strong>{item.title}</strong>
                {item.isPinned && <span className="smk-admin-pin-tag"><Icon name="pin" size={12} /> Tersemat</span>}
              </td>
              <td>
                <span className={`smk-admin-badge smk-tipe-${item.type || "biasa"}`}>
                  {LABEL_TIPE_PENGUMUMAN[item.type] || "Biasa"}
                </span>
              </td>
              <td className="smk-admin-td-truncate">{plainText(item.content, 80)}</td>
              <td>{item.expiredAt ? String(item.expiredAt).slice(0, 10) : "-"}</td>
              <td>
                <ActionButtons
                  onEdit={() => openEdit(item)}
                  onDelete={() => handleDelete(item)}
                  onPin={() => dispatch(asyncTogglePinPengumuman(item.id))}
                  pinned={!!item.isPinned}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal
        open={modalOpen}
        onClose={handleClose}
        title={editItem ? "Edit Pengumuman" : "Tambah Pengumuman"}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        <div className="smk-form-group">
          <label>Judul Pengumuman <span style={{ color: "red" }}>*</span></label>
          <input
            className="smk-form-input" type="text"
            value={title} onChange={setTitle}
            placeholder="contoh: Libur Hari Raya Idul Fitri"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="smk-form-group">
            <label>Tipe</label>
            <select className="smk-form-input" value={type} onChange={setType}>
              {PENGUMUMAN_TYPES.map((t) => (
                <option key={t} value={t}>{LABEL_TIPE_PENGUMUMAN[t]}</option>
              ))}
            </select>
          </div>
          <div className="smk-form-group">
            <label>Berlaku Sampai (opsional)</label>
            <input className="smk-form-input" type="date" value={expiredAt} onChange={setExpiredAt} />
          </div>
        </div>
        <div className="smk-form-group">
          <label>Deskripsi Singkat (opsional)</label>
          <input
            className="smk-form-input" type="text"
            value={description} onChange={setDescription}
            placeholder="Ringkasan singkat pengumuman..."
          />
        </div>
        <div className="smk-form-group">
          <label>Isi Pengumuman <span style={{ color: "red" }}>*</span></label>
          <RichTextEditor
            value={content}
            onChange={(html) => setContent({ target: { value: html } })}
            placeholder="Tulis isi pengumuman lengkap di sini..."
          />
        </div>
        <UploadArea
          id="pengumumanGambar"
          onFile={handleFile}
          preview={preview}
          label="Pilih gambar pengumuman (opsional)"
        />
      </AdminModal>
    </AdminLayout>
  );
}
