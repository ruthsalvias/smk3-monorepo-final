// src/features/admin/pages/AdminDashboardPage.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { AdminStatCard } from "../components/AdminComponents";
import { asyncLoadAllProfilData } from "../../profil/states/action";
import {
  asyncGetBerita,
  asyncGetAgenda,
  asyncGetPengumuman,
} from "../../berita/states/action";
import Icon from "../../../components/Icon";
import { adminPath } from "../../../config/adminPath";

const quickActions = [
  { to: adminPath("/berita"),     icon: "news",       label: "Tulis Berita",     desc: "Publikasikan kabar sekolah" },
  { to: adminPath("/pengumuman"), icon: "megaphone",  label: "Pengumuman",       desc: "Informasi resmi ke warga sekolah" },
  { to: adminPath("/agenda"),     icon: "calendar",   label: "Agenda",           desc: "Jadwal kegiatan mendatang" },
  { to: adminPath("/prestasi"),   icon: "trophy",     label: "Prestasi",         desc: "Catat capaian siswa" },
  { to: adminPath("/program"),    icon: "graduation", label: "Program Keahlian", desc: "Kelola jurusan" },
  { to: adminPath("/fasilitas"),  icon: "building",   label: "Fasilitas",        desc: "Sarana & prasarana" },
  { to: adminPath("/pengaturan"), icon: "settings",   label: "Pengaturan",       desc: "Identitas & kontak sekolah" },
  { to: adminPath("/statistik"),  icon: "chart",      label: "Statistik",        desc: "Angka capaian di beranda" },
];

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const sejarah    = useSelector((s) => s.sejarahIdentitas);
  const visiMisi   = useSelector((s) => s.visiMisi);
  const program    = useSelector((s) => s.programKeahlian);
  const fasilitas  = useSelector((s) => s.fasilitas);
  const prestasi   = useSelector((s) => s.prestasi);
  const mitra      = useSelector((s) => s.mitraKerjasama);
  const berita     = useSelector((s) => s.berita || []);
  const agenda     = useSelector((s) => s.agenda || []);
  const pengumuman = useSelector((s) => s.pengumuman || []);

  useEffect(() => {
    dispatch(asyncLoadAllProfilData());
    dispatch(asyncGetBerita());
    dispatch(asyncGetAgenda());
    dispatch(asyncGetPengumuman());
  }, [dispatch]);

  const beritaTerbaru = [...berita]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const agendaMendatang = [...agenda]
    .filter((a) => a.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const formatTanggal = (value) =>
    value
      ? new Date(value).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <AdminLayout title="Dashboard">
      {/* HERO */}
      <section className="smk-admin-hero">
        <div className="smk-admin-hero-text">
          <span className="smk-admin-hero-tag">Pusat Kendali Konten</span>
          <h2>Kelola informasi sekolah dari satu tempat</h2>
          <p>
            Berita, pengumuman, agenda, hingga profil sekolah — semuanya langsung
            tersaji di halaman publik setelah disimpan.
          </p>
          <div className="smk-admin-hero-actions">
            <NavLink to={adminPath("/berita")} className="smk-admin-hero-btn">
              Tulis Berita Baru
            </NavLink>
            <a href="/" target="_blank" rel="noreferrer" className="smk-admin-hero-btn ghost">
              Lihat Website
            </a>
          </div>
        </div>
        <div className="smk-admin-hero-figures">
          <div>
            <strong>{berita.length}</strong>
            <span>Berita</span>
          </div>
          <div>
            <strong>{pengumuman.length}</strong>
            <span>Pengumuman</span>
          </div>
          <div>
            <strong>{agenda.length}</strong>
            <span>Agenda</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <h3 className="smk-admin-section-title">Ringkasan Konten</h3>
      <div className="smk-admin-stats-row">
        <AdminStatCard icon={<Icon name="news" size={22} />}       value={berita.length}     label="Berita"              color="gold"   />
        <AdminStatCard icon={<Icon name="megaphone" size={22} />}  value={pengumuman.length} label="Pengumuman"          color="navy"   />
        <AdminStatCard icon={<Icon name="calendar" size={22} />}   value={agenda.length}     label="Agenda"              color="teal"   />
        <AdminStatCard icon={<Icon name="scroll" size={22} />}     value={sejarah.length}    label="Sejarah & Identitas" color="blue"   />
        <AdminStatCard icon={<Icon name="target" size={22} />}     value={visiMisi.length}   label="Visi & Misi"         color="purple" />
        <AdminStatCard icon={<Icon name="graduation" size={22} />} value={program.length}    label="Program Keahlian"    color="orange" />
        <AdminStatCard icon={<Icon name="building" size={22} />}   value={fasilitas.length}  label="Fasilitas"           color="blue"   />
        <AdminStatCard icon={<Icon name="trophy" size={22} />}     value={prestasi.length}   label="Prestasi"            color="gold"   />
        <AdminStatCard icon={<Icon name="handshake" size={22} />}  value={mitra.length}      label="Mitra Kerjasama"     color="navy"   />
      </div>

      <div className="smk-admin-dashboard-grid">
        {/* BERITA TERBARU */}
        <div className="smk-admin-card">
          <div className="smk-admin-card-header">
            <div>
              <div className="smk-admin-card-title">Berita Terbaru</div>
              <div className="smk-admin-card-sub">5 publikasi paling akhir</div>
            </div>
            <NavLink to={adminPath("/berita")} className="smk-admin-link">
              Kelola <Icon name="arrowRight" size={14} />
            </NavLink>
          </div>
          <div className="smk-admin-card-body">
            {beritaTerbaru.length ? (
              <ul className="smk-admin-feed">
                {beritaTerbaru.map((item) => (
                  <li key={item.id}>
                    <span className="smk-admin-feed-dot" />
                    <div>
                      <strong>{item.title}</strong>
                      <span>{formatTanggal(item.createdAt)} · {item.author || "Admin"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="smk-admin-empty">Belum ada berita yang dipublikasikan.</p>
            )}
          </div>
        </div>

        {/* AGENDA MENDATANG */}
        <div className="smk-admin-card">
          <div className="smk-admin-card-header">
            <div>
              <div className="smk-admin-card-title">Agenda Terdekat</div>
              <div className="smk-admin-card-sub">Jadwal kegiatan sekolah</div>
            </div>
            <NavLink to={adminPath("/agenda")} className="smk-admin-link">
              Kelola <Icon name="arrowRight" size={14} />
            </NavLink>
          </div>
          <div className="smk-admin-card-body">
            {agendaMendatang.length ? (
              <ul className="smk-admin-agenda-list">
                {agendaMendatang.map((item) => (
                  <li key={item.id}>
                    <span className="smk-admin-agenda-date">
                      <strong>{new Date(item.date).getDate()}</strong>
                      <span>
                        {new Date(item.date).toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.location || "Lokasi belum ditentukan"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="smk-admin-empty">Belum ada agenda terjadwal.</p>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="smk-admin-card">
        <div className="smk-admin-card-header">
          <div>
            <div className="smk-admin-card-title">Aksi Cepat</div>
            <div className="smk-admin-card-sub">Pintasan ke modul yang sering dipakai</div>
          </div>
        </div>
        <div className="smk-admin-card-body">
          <div className="smk-admin-quick-grid">
            {quickActions.map((q) => (
              <NavLink key={q.to} to={q.to} className="smk-admin-quick-item">
                <span className="smk-admin-quick-icon">
                  <Icon name={q.icon} size={22} />
                </span>
                <span className="smk-admin-quick-label">{q.label}</span>
                <span className="smk-admin-quick-desc">{q.desc}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
