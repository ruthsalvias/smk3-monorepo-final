import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import ProfilLayout from "../layouts/ProfilLayout";
import { beritaMediaUrl } from "../../admin/components/AdminComponents";
import beritaApi from "../../berita/api/beritaApi";
import { useSiteSettings } from "../context/SiteSettingsContext";
import Icon from "../../../components/Icon";
import { sanitizeHtml } from "../../../components/RichTextEditor";

const TIPE_META = {
  berita: { label: "Berita", fetch: (id) => beritaApi.getBeritaById(id) },
  pengumuman: { label: "Pengumuman", fetch: (id) => beritaApi.getPengumumanById(id) },
  agenda: { label: "Agenda", fetch: (id) => beritaApi.getAgendaById(id) },
};

const formatTanggal = (value) =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

export default function BeritaDetailPage() {
  const { tipe, id } = useParams();
  const { pengaturan } = useSiteSettings();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const meta = TIPE_META[tipe];

  useEffect(() => {
    let alive = true;
    if (!meta) {
      setError("Jenis informasi tidak dikenal.");
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError(null);
    meta
      .fetch(id)
      .then((data) => {
        if (alive) setItem(data?.data ?? data);
      })
      .catch(() => {
        if (alive) setError("Informasi tidak ditemukan atau sudah dihapus.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [meta, id]);

  const gambar = item ? beritaMediaUrl(item.imageUrl) : null;
  const tanggal = item ? item.date || item.createdAt : null;
  const isi = item?.content || item?.description || "";

  return (
    <ProfilLayout>
      <section className="smk-subpage-hero">
        <div className="smk-container">
          <span className="smk-badge">{meta?.label || "Informasi"}</span>
          <h1 className="smk-subpage-title">
            {loading ? "Memuat…" : item?.title || "Informasi tidak tersedia"}
          </h1>
          {item && (
            <p className="smk-subpage-subtitle">
              {formatTanggal(tanggal)}
              {item.author ? ` · ${item.author}` : ""}
            </p>
          )}
        </div>
      </section>

      <section className="smk-section">
        <div className="smk-container smk-detail-container">
          <NavLink to="/berita" className="smk-back-link">
            <Icon name="chevronLeft" size={16} /> Kembali ke Berita &amp; Informasi
          </NavLink>

          {loading ? (
            <p className="smk-state-text">Memuat informasi…</p>
          ) : error ? (
            <p className="smk-state-text">{error}</p>
          ) : (
            <article className="smk-detail-card">
              {gambar ? (
                <div className="smk-detail-img">
                  <img src={gambar} alt={item.title} />
                </div>
              ) : (
                <div className="smk-detail-img smk-detail-img-empty">
                  <span>{pengaturan.nama_singkat}</span>
                </div>
              )}

              <div className="smk-detail-meta">
                <span>
                  <Icon name="calendar" size={15} /> {formatTanggal(tanggal)}
                </span>
                {item.location && (
                  <span>
                    <Icon name="mapPin" size={15} /> {item.location}
                  </span>
                )}
                {item.startTime && (
                  <span>
                    <Icon name="clock" size={15} /> {item.startTime.slice(0, 5)}
                    {item.endTime ? ` - ${item.endTime.slice(0, 5)}` : ""}
                  </span>
                )}
                {item.participants && (
                  <span>
                    <Icon name="users" size={15} /> {item.participants}
                  </span>
                )}
                {typeof item.views === "number" && (
                  <span>
                    <Icon name="eye" size={15} /> {item.views} kali dibaca
                  </span>
                )}
              </div>

              {item.description && item.content && (
                <p className="smk-detail-lead">{item.description}</p>
              )}

              <div className="smk-detail-body smk-richtext">
                {isi ? (
                  /<\/?[a-z][\s\S]*>/i.test(isi) ? (
                    // Konten dari editor tersimpan sebagai HTML; selalu disanitasi sebelum dirender.
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(isi) }} />
                  ) : (
                    isi.split(/\n{2,}/).map((paragraf, index) => <p key={index}>{paragraf}</p>)
                  )
                ) : (
                  <p>Belum ada isi untuk informasi ini.</p>
                )}
              </div>
            </article>
          )}
        </div>
      </section>
    </ProfilLayout>
  );
}
