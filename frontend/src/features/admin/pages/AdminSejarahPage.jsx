// src/features/admin/pages/AdminSejarahPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../layouts/AdminLayout";
import { AdminCard, AdminTable, AdminModal, ActionButtons } from "../components/AdminComponents";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import useInput from "../../../hooks/useInput";
import {
  asyncGetSejarahIdentitas,
  asyncPostSejarahIdentitas,
  asyncPutSejarahIdentitas,
  asyncDeleteSejarahIdentitas,
} from "../../profil/states/action";

export function AdminSejarahPage() {
  const dispatch = useDispatch();
  const data     = useSelector((s) => s.sejarahIdentitas);
  const loading  = useSelector((s) => s.profilLoading);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [tahun,     setTahun]     = useInput("");
  const [deskripsi, setDeskripsi] = useInput("");

  useEffect(() => { dispatch(asyncGetSejarahIdentitas()); }, [dispatch]);

  const openAdd = () => {
    setEditItem(null);
    setTahun({ target: { value: "" } });
    setDeskripsi({ target: { value: "" } });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setTahun({ target: { value: item.tahun_berdiri } });
    setDeskripsi({ target: { value: item.deskripsi } });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const cb = () => { setModalOpen(false); setSubmitting(false); };
    if (editItem) dispatch(asyncPutSejarahIdentitas(editItem.id, tahun, deskripsi, cb));
    else          dispatch(asyncPostSejarahIdentitas(tahun, deskripsi, cb));
    setTimeout(() => setSubmitting(false), 3000);
  };

  const handleDelete = async (item) => {
    const result = await showConfirmDialog(`Hapus data tahun ${item.tahun_berdiri}?`);
    if (result.isConfirmed) dispatch(asyncDeleteSejarahIdentitas(item.id));
  };

  return (
    <AdminLayout title="Sejarah & Identitas">
      <AdminCard
        title="Sejarah & Identitas"
        subtitle="Kelola data sejarah dan identitas sekolah"
        onAdd={openAdd}
      >
        <AdminTable columns={["Tahun Berdiri", "Deskripsi", "Aksi"]} loading={loading} empty={!data.length}>
          {data.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.tahun_berdiri}</strong></td>
              <td className="smk-admin-td-truncate">{item.deskripsi?.slice(0, 100)}...</td>
              <td><ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} /></td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Sejarah" : "Tambah Sejarah"}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        <div className="smk-form-group">
          <label>Tahun Berdiri</label>
          <input className="smk-form-input" type="text" value={tahun} onChange={setTahun} placeholder="contoh: 1995" />
        </div>
        <div className="smk-form-group">
          <label>Deskripsi</label>
          <textarea className="smk-form-input" rows={5} value={deskripsi} onChange={setDeskripsi} placeholder="Ceritakan sejarah sekolah..." />
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
