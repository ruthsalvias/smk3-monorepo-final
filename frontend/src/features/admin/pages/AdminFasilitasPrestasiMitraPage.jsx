// src/features/admin/pages/AdminFasilitasPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../layouts/AdminLayout";
import { AdminCard, AdminTable, AdminModal, AdminThumb, ActionButtons, UploadArea, mediaUrl } from "../components/AdminComponents";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import useInput from "../../../hooks/useInput";
import Icon from "../../../components/Icon";
import {
  asyncGetFasilitas, asyncPostFasilitas,
  asyncPutFasilitas, asyncDeleteFasilitas,
} from "../../profil/states/action";

export function AdminFasilitasPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.fasilitas);
  const loading  = useSelector((s) => s.profilLoading);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [nama, setNama]             = useInput("");
  const [deskripsi, setDeskripsi]   = useInput("");

  useEffect(() => { dispatch(asyncGetFasilitas()); }, [dispatch]);

  const openAdd = () => {
    setEditItem(null);
    setNama({ target: { value: "" } });
    setDeskripsi({ target: { value: "" } });
    setFile(null); setPreview(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setNama({ target: { value: item.nama_fasilitas } });
    setDeskripsi({ target: { value: item.deskripsi ?? "" } });
    setFile(null);
    setPreview(item.foto ? mediaUrl(item.foto) : null);
    setModalOpen(true);
  };

  const handleFile = (f) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const cb = () => { setModalOpen(false); setSubmitting(false); };
    if (editItem) dispatch(asyncPutFasilitas(editItem.id, nama, deskripsi, file, cb));
    else          dispatch(asyncPostFasilitas(nama, deskripsi, file, cb));
    setTimeout(() => setSubmitting(false), 5000);
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus fasilitas "${item.nama_fasilitas}"?`);
    if (r.isConfirmed) dispatch(asyncDeleteFasilitas(item.id));
  };

  return (
    <AdminLayout title="Fasilitas">
      <AdminCard title="Fasilitas & Sarana Belajar" subtitle="Kelola data fasilitas sekolah" onAdd={openAdd}>
        <AdminTable columns={["Foto", "Nama Fasilitas", "Deskripsi", "Aksi"]} loading={loading} empty={!data.length}>
          {data.map((item) => (
            <tr key={item.id}>
              <td><AdminThumb src={mediaUrl(item.foto)} fallback={<Icon name="building" size={18} />} /></td>
              <td><strong>{item.nama_fasilitas}</strong></td>
              <td className="smk-admin-td-truncate">{item.deskripsi?.slice(0, 80)}</td>
              <td><ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} /></td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Fasilitas" : "Tambah Fasilitas"}
        onSubmit={handleSubmit} submitting={submitting}>
        <div className="smk-form-group">
          <label>Nama Fasilitas</label>
          <input className="smk-form-input" type="text" value={nama} onChange={setNama} placeholder="contoh: Lab Komputer & Jaringan" />
        </div>
        <div className="smk-form-group">
          <label>Deskripsi</label>
          <textarea className="smk-form-input" rows={3} value={deskripsi} onChange={setDeskripsi} placeholder="Deskripsi fasilitas..." />
        </div>
        <UploadArea id="fasilitasFoto" onFile={handleFile} preview={preview} label="Pilih foto fasilitas (opsional)" />
      </AdminModal>
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// PRESTASI
// ─────────────────────────────────────────────────────────────
import { TingkatBadge } from "../components/AdminComponents";
import {
  asyncGetPrestasi, asyncPostPrestasi,
  asyncPutPrestasi, asyncDeletePrestasi,
} from "../../profil/states/action";

export function AdminPrestasiPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.prestasi);
  const loading  = useSelector((s) => s.profilLoading);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [judul, setJudul]           = useInput("");
  const [tahun, setTahun]           = useInput("");
  const [keterangan, setKeterangan] = useInput("");
  const [tingkat, setTingkat]       = useState("provinsi");

  useEffect(() => { dispatch(asyncGetPrestasi()); }, [dispatch]);

  const openAdd = () => {
    setEditItem(null);
    setJudul({ target: { value: "" } });
    setTahun({ target: { value: "" } });
    setKeterangan({ target: { value: "" } });
    setTingkat("provinsi");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setJudul({ target: { value: item.judul } });
    setTahun({ target: { value: item.tahun } });
    setKeterangan({ target: { value: item.keterangan ?? "" } });
    setTingkat(item.tingkat);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const cb = () => { setModalOpen(false); setSubmitting(false); };
    if (editItem) dispatch(asyncPutPrestasi(editItem.id, judul, tingkat, tahun, keterangan, cb));
    else          dispatch(asyncPostPrestasi(judul, tingkat, tahun, keterangan, cb));
    setTimeout(() => setSubmitting(false), 3000);
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus prestasi "${item.judul}"?`);
    if (r.isConfirmed) dispatch(asyncDeletePrestasi(item.id));
  };

  return (
    <AdminLayout title="Prestasi">
      <AdminCard title="Akreditasi & Prestasi" subtitle="Kelola data prestasi sekolah" onAdd={openAdd}>
        <AdminTable columns={["Judul", "Tingkat", "Tahun", "Keterangan", "Aksi"]} loading={loading} empty={!data.length}>
          {data.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.judul}</strong></td>
              <td><TingkatBadge tingkat={item.tingkat} /></td>
              <td><strong>{item.tahun}</strong></td>
              <td className="smk-admin-td-truncate">{item.keterangan?.slice(0, 60)}</td>
              <td><ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} /></td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Prestasi" : "Tambah Prestasi"}
        onSubmit={handleSubmit} submitting={submitting}>
        <div className="smk-form-group">
          <label>Judul Prestasi</label>
          <input className="smk-form-input" type="text" value={judul} onChange={setJudul} placeholder="contoh: Juara I LKS Electronic Application" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="smk-form-group">
            <label>Tingkat</label>
            <select className="smk-form-input" value={tingkat} onChange={(e) => setTingkat(e.target.value)}>
              <option value="internasional">Internasional</option>
              <option value="nasional">Nasional</option>
              <option value="provinsi">Provinsi</option>
              <option value="kabupaten">Kabupaten</option>
            </select>
          </div>
          <div className="smk-form-group">
            <label>Tahun</label>
            <input className="smk-form-input" type="text" value={tahun} onChange={setTahun} placeholder="contoh: 2024" />
          </div>
        </div>
        <div className="smk-form-group">
          <label>Keterangan (opsional)</label>
          <textarea className="smk-form-input" rows={3} value={keterangan} onChange={setKeterangan} placeholder="Keterangan tambahan..." />
        </div>
      </AdminModal>
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// MITRA KERJASAMA
// ─────────────────────────────────────────────────────────────
import {
  asyncGetMitraKerjasama, asyncPostMitraKerjasama,
  asyncPutMitraKerjasama, asyncDeleteMitraKerjasama,
} from "../../profil/states/action";

export function AdminMitraPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.mitraKerjasama);
  const loading  = useSelector((s) => s.profilLoading);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [nama, setNama]             = useInput("");
  const [deskripsi, setDeskripsi]   = useInput("");

  useEffect(() => { dispatch(asyncGetMitraKerjasama()); }, [dispatch]);

  const openAdd = () => {
    setEditItem(null);
    setNama({ target: { value: "" } });
    setDeskripsi({ target: { value: "" } });
    setFile(null); setPreview(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setNama({ target: { value: item.nama_mitra } });
    setDeskripsi({ target: { value: item.deskripsi ?? "" } });
    setFile(null);
    setPreview(item.logo ? mediaUrl(item.logo) : null);
    setModalOpen(true);
  };

  const handleFile = (f) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const cb = () => { setModalOpen(false); setSubmitting(false); };
    if (editItem) dispatch(asyncPutMitraKerjasama(editItem.id, nama, deskripsi, file, cb));
    else          dispatch(asyncPostMitraKerjasama(nama, deskripsi, file, cb));
    setTimeout(() => setSubmitting(false), 5000);
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus mitra "${item.nama_mitra}"?`);
    if (r.isConfirmed) dispatch(asyncDeleteMitraKerjasama(item.id));
  };

  return (
    <AdminLayout title="Mitra Kerjasama">
      <AdminCard title="Mitra Kerjasama" subtitle="Kelola data mitra industri sekolah" onAdd={openAdd}>
        <AdminTable columns={["Logo", "Nama Mitra", "Deskripsi", "Aksi"]} loading={loading} empty={!data.length}>
          {data.map((item) => (
            <tr key={item.id}>
              <td><AdminThumb src={mediaUrl(item.logo)} fallback={<Icon name="handshake" size={18} />} /></td>
              <td><strong>{item.nama_mitra}</strong></td>
              <td className="smk-admin-td-truncate">{item.deskripsi?.slice(0, 80)}</td>
              <td><ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} /></td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Mitra" : "Tambah Mitra"}
        onSubmit={handleSubmit} submitting={submitting}>
        <div className="smk-form-group">
          <label>Nama Mitra</label>
          <input className="smk-form-input" type="text" value={nama} onChange={setNama} placeholder="contoh: PT. PLN (Persero)" />
        </div>
        <div className="smk-form-group">
          <label>Deskripsi</label>
          <textarea className="smk-form-input" rows={3} value={deskripsi} onChange={setDeskripsi} placeholder="Deskripsi singkat mitra..." />
        </div>
        <UploadArea id="mitraLogo" onFile={handleFile} preview={preview} label="Pilih logo mitra (opsional)" />
      </AdminModal>
    </AdminLayout>
  );
}
