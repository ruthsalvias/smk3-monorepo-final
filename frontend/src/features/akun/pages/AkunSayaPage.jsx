import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../../profil/components/NavbarComponent";
import Footer from "../../profil/components/FooterComponent";
import Icon from "../../../components/Icon";
import DaftarDokumen from "../../../components/DaftarDokumen";
import { useAuth } from "../../auth/context/AuthContext";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { ubahPasswordSendiri } from "../../admin/api/akunApi";
import {
  getDokumenSaya,
  kelompokkanDokumen,
  lihatDokumenSaya,
  unduhDokumenSaya,
  JENIS_DOKUMEN,
} from "../api/dokumenApi";

export default function AkunSayaPage() {
  const { isAuth, login, user, roles } = useAuth();
  const isSiswa = roles.includes("siswa");

  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  const [siswa, setSiswa] = useState(null);
  const [memuat, setMemuat] = useState(false);
  const [pesanDokumen, setPesanDokumen] = useState("");

  useEffect(() => {
    if (!isAuth || !isSiswa) return;
    setMemuat(true);
    getDokumenSaya()
      .then(setSiswa)
      .catch((err) => setPesanDokumen(err.message))
      .finally(() => setMemuat(false));
  }, [isAuth, isSiswa]);

  if (!isAuth) {
    return (
      <div className="smk-akun-gate">
        <p>Silakan masuk untuk mengelola akun Anda.</p>
        <button className="smk-btn-primary" onClick={login}>
          Masuk
        </button>
      </div>
    );
  }

  if (roles.includes("admin") && !isSiswa && !roles.includes("guru")) {
    return <Navigate to="/" replace />;
  }

  const simpanPassword = async (e) => {
    e.preventDefault();
    if (passwordBaru.length < 8) {
      showErrorDialog("Password baru minimal 8 karakter");
      return;
    }
    if (passwordBaru !== konfirmasi) {
      showErrorDialog("Konfirmasi password tidak sama");
      return;
    }
    setMenyimpan(true);
    try {
      await ubahPasswordSendiri(passwordBaru);
      setPasswordBaru("");
      setKonfirmasi("");
      showSuccessDialog("Password berhasil diubah");
    } catch (err) {
      showErrorDialog(
        err?.response?.data?.message || err.message || "Gagal mengubah password",
      );
    } finally {
      setMenyimpan(false);
    }
  };

  const lihat = async (dok) => {
    try {
      await lihatDokumenSaya(dok.id);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  const unduh = async (dok) => {
    try {
      await unduhDokumenSaya(dok.id, dok.nama);
    } catch (err) {
      showErrorDialog(err.message);
    }
  };

  return (
    <div className="smk-akun-page">
      <Navbar />

      <section className="smk-subpage-hero">
        <div className="smk-container smk-center">
          <span className="smk-badge">Akun</span>
          <h1 className="smk-subpage-title">Akun Saya</h1>
          <p className="smk-subpage-subtitle">
            Kelola password Anda{isSiswa && " dan unduh dokumen akademik milik Anda"}.
          </p>
        </div>
      </section>

      <div className="smk-akun-wrap">
        <div className="smk-akun-panel">
          <h2>
            <Icon name="shield" size={18} /> Ubah Password
          </h2>
          <p className="smk-akun-hint">
            Masuk sebagai <strong>{user?.username}</strong>. Password langsung berubah setelah
            disimpan.
          </p>
          <form onSubmit={simpanPassword}>
            <label>
              Password Baru
              <input
                type="password"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
              />
            </label>
            <label>
              Konfirmasi Password Baru
              <input
                type="password"
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <button className="smk-btn-primary" type="submit" disabled={menyimpan}>
              {menyimpan ? "Menyimpan..." : "Simpan Password"}
            </button>
          </form>
        </div>

        {isSiswa && (
          <div className="smk-akun-panel">
            <h2>
              <Icon name="news" size={18} /> Dokumen Saya
            </h2>
            {memuat ? (
              <p className="smk-akun-hint">Memuat dokumen...</p>
            ) : !siswa ? (
              <p className="smk-akun-hint">
                {pesanDokumen || "Data siswa untuk akun ini belum ditemukan."}
              </p>
            ) : (
              <>
                <p className="smk-akun-hint">
                  {siswa.namaLengkap} — NIS {siswa.nis || "-"}, kelas {siswa.kelas || "-"}
                </p>
                <ul className="smk-akun-dokumen">
                  {JENIS_DOKUMEN.map((d) => (
                    <li key={d.nilai}>
                      <span>{d.label}</span>
                      <DaftarDokumen
                        dokumen={kelompokkanDokumen(siswa)[d.nilai]}
                        onLihat={lihat}
                        onUnduh={unduh}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
