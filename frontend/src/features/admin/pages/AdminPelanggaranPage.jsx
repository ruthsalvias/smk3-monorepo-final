import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { AdminCard, AdminTable, AdminModal, ActionButtons } from "../components/AdminComponents";
import { showConfirmDialog, showErrorDialog } from "../../../helpers/toolsHelper";

// 1. Import konfigurasi Axios yang sudah mengarah ke API Gateway (Port 6766)
import apiGateway from "../../../config/axios";

// 2. Buat prefix untuk mempersingkat path URL
const PREFIX = "/pelanggaran/surat-panggilan";

export default function AdminPelanggaranPage() {
  const [data, setData] = useState([]);
  const [masterSiswa, setMasterSiswa] = useState([]);
  const [masterGuru, setMasterGuru] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showGuruDropdown, setShowGuruDropdown] = useState(false);
  const [editId, setEditId] = useState(null); 
  
  const [idSiswa, setIdSiswa] = useState("");
  const [noSurat, setNoSurat] = useState("");
  const [permasalahan, setPermasalahan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("09.00 WIB - Selesai");
  const [tempat, setTempat] = useState("Ruang BK SMK Negeri 3 Balige");
  const [idPenandatangan, setIdPenandatangan] = useState([]);

  useEffect(() => {
    fetchData();
    fetchMasterData();
  }, []);

  // ── MENGGUNAKAN AXIOS BUKAN FETCH ────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiGateway.get(PREFIX);
      if (res.data.status === "success") setData(res.data.data);
    } catch (error) {
      console.error("Gagal load data surat:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const resSiswa = await apiGateway.get(`${PREFIX}/master/siswa`);
      if (resSiswa.data.status === "success") setMasterSiswa(resSiswa.data.data);

      const resGuru = await apiGateway.get(`${PREFIX}/master/guru`);
      if (resGuru.data.status === "success") setMasterGuru(resGuru.data.data);
    } catch (error) {
      console.error("Gagal load master data:", error);
    }
  };

  const handleCheckboxChange = (guruId) => {
    setIdPenandatangan((prev) => 
      prev.includes(guruId) ? prev.filter((id) => id !== guruId) : [...prev, guruId]
    );
  };

  const openAdd = () => {
    setEditId(null);
    setIdSiswa("");
    setNoSurat("");
    setPermasalahan("");
    setTanggal("");
    setWaktu("09.00 WIB - Selesai");
    setTempat("Ruang BK SMK Negeri 3 Balige");
    setIdPenandatangan([]);
    setShowGuruDropdown(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setIdSiswa(item.id_siswa);
    setNoSurat(item.no_surat);
    setPermasalahan(item.permasalahan || "");
    setTanggal(item.tanggal_panggilan);
    setWaktu(item.waktu_panggilan || "");
    setTempat(item.tempat || "");
    setIdPenandatangan(item.id_penandatangan || []);
    setShowGuruDropdown(false);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!idSiswa || !noSurat || !tanggal || idPenandatangan.length === 0) {
      alert("Mohon lengkapi data wajib dan pilih minimal 1 guru penandatangan!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id_siswa: idSiswa,
        no_surat: noSurat,
        permasalahan,
        tanggal_panggilan: tanggal,
        waktu_panggilan: waktu,
        tempat,
        id_penandatangan: idPenandatangan
      };

      const targetUrl = editId ? `${PREFIX}/${editId}` : PREFIX;

      if (editId) {
        await apiGateway.put(targetUrl, payload);
      } else {
        await apiGateway.post(targetUrl, payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan surat. Periksa jaringan backend.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const r = await showConfirmDialog(`Hapus surat nomor: ${item.no_surat}?`);
    if (r.isConfirmed) {
      try {
        await apiGateway.delete(`${PREFIX}/${item.id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDownloadPDF = async (id, namaSiswa = "") => {
    // Endpoint PDF butuh Authorization header, jadi harus lewat axios (bukan window.open).
    try {
      const res = await apiGateway.get(`${PREFIX}/${id}/pdf`, { responseType: "blob" });

      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const namaBersih = namaSiswa.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
      const fileName = match
        ? match[1]
        : `Surat_Panggilan_${namaBersih || id}.pdf`;

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal mengunduh PDF:", error);
      showErrorDialog("Surat panggilan tidak dapat diunduh. Coba lagi.");
    }
  };

  const handleSendWA = async (id) => {
    try {
      const res = await apiGateway.get(`${PREFIX}/${id}/whatsapp`);
      if (res.data.status === "success") {
        window.open(res.data.data.link_whatsapp, "_blank");
      } else {
        alert(res.data.message || "Gagal membuat link WhatsApp");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat memuat link WA.");
    }
  };

  const getNamaSiswa = (id) => {
    const siswa = masterSiswa.find(s => s.id === id);
    return siswa ? siswa.nama : "Siswa tidak diketahui";
  };

  return (
    <AdminLayout title="Pelanggaran & Surat Panggilan">
      <AdminCard 
        title="Daftar Surat Panggilan" 
        subtitle="Kelola dan cetak surat panggilan orang tua wali" 
        onAdd={openAdd}
        addLabel="+ Buat Surat Baru"
      >
        <AdminTable columns={["No Surat", "Nama Siswa", "Tanggal", "Aksi Terintegrasi", "Aksi"]} loading={loading} empty={!data.length}>
          {data.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.no_surat}</strong></td>
              <td>{getNamaSiswa(item.id_siswa)}</td>
              <td>{item.tanggal_panggilan}</td>
              
              <td>
                <div className="smk-admin-actions">
                  <button 
                    onClick={() => handleDownloadPDF(item.id, getNamaSiswa(item.id_siswa))}
                    className="smk-admin-btn-edit" 
                    style={{ backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
                  >
                    Cetak PDF
                  </button>
                  <button 
                    onClick={() => handleSendWA(item.id)}
                    className="smk-admin-btn-edit"
                    style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}
                  >
                    WA Ortu
                  </button>
                </div>
              </td>

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
        onClose={() => setModalOpen(false)}
        title={editId ? "Edit Surat Panggilan" : "Buat Surat Panggilan Baru"}
        onSubmit={handleSubmit} 
        submitting={submitting}
      >
        <div className="smk-form-group">
          <label>Pilih Siswa <span style={{color: 'red'}}>*</span></label>
          <select className="smk-form-input" value={idSiswa} onChange={(e) => setIdSiswa(e.target.value)}>
            <option value="">-- Pilih Siswa Bermasalah --</option>
            {masterSiswa.map(s => (
              <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="smk-form-group">
            <label>Nomor Surat <span style={{color: 'red'}}>*</span></label>
            <input className="smk-form-input" type="text" value={noSurat} onChange={(e) => setNoSurat(e.target.value)} placeholder="421.5/xxx/SMKN3/2026" />
          </div>
          <div className="smk-form-group">
            <label>Tanggal Panggilan <span style={{color: 'red'}}>*</span></label>
            <input className="smk-form-input" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="smk-form-group">
            <label>Waktu</label>
            <input className="smk-form-input" type="text" value={waktu} onChange={(e) => setWaktu(e.target.value)} />
          </div>
          <div className="smk-form-group">
            <label>Tempat</label>
            <input className="smk-form-input" type="text" value={tempat} onChange={(e) => setTempat(e.target.value)} />
          </div>
        </div>

        <div className="smk-form-group">
          <label>Permasalahan</label>
          <textarea className="smk-form-input" rows={2} value={permasalahan} onChange={(e) => setPermasalahan(e.target.value)} placeholder="Contoh: Sering bolos dan tidak membuat tugas" />
        </div>

        <div className="smk-form-group">
          <label>Penandatangan <span style={{color: 'red'}}>*</span></label>
          
          <div 
            className="smk-form-input" 
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', userSelect: 'none' }}
            onClick={() => setShowGuruDropdown(!showGuruDropdown)}
          >
            <span style={{ color: idPenandatangan.length ? '#0f2244' : '#94a3b8' }}>
              {idPenandatangan.length > 0 ? `${idPenandatangan.length} Guru Dipilih` : "-- Klik untuk pilih Guru --"}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>{showGuruDropdown ? "▲" : "▼"}</span>
          </div>

          {showGuruDropdown && (
            <div style={{ border: '1px solid #e5e9f2', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px', maxHeight: '160px', overflowY: 'auto', background: '#f8faff', marginTop: '-4px' }}>
              {masterGuru.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>Gagal memuat data guru.</div>
              ) : (
                masterGuru.map(guru => (
                  <label key={guru.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      checked={idPenandatangan.includes(guru.id)}
                      onChange={() => handleCheckboxChange(guru.id)}
                    />
                    <div>
                      <strong style={{ color: '#0f2244' }}>{guru.nama}</strong> <br/>
                      <span style={{color: '#64748b', fontSize: '11px'}}>{guru.jabatan}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
      </AdminModal>
    </AdminLayout>
  );
}