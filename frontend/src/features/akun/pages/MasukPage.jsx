import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ADMIN_PATH } from "../../../config/adminPath";

// Satu pintu masuk untuk semua peran; tujuan ditentukan dari role akun.
export default function MasukPage() {
  const { isAuth, login, roles = [] } = useAuth();

  useEffect(() => {
    if (!isAuth) login();
  }, [isAuth, login]);

  if (!isAuth) {
    return (
      <div className="smk-akun-gate">
        <p>Mengarahkan ke halaman masuk...</p>
        <button className="smk-btn-primary" onClick={login}>
          Masuk
        </button>
      </div>
    );
  }

  if (roles.includes("master_admin") || roles.includes("admin")) {
    return <Navigate to={ADMIN_PATH} replace />;
  }
  if (roles.includes("guru")) return <Navigate to="/guru/dokumen" replace />;
  if (roles.includes("siswa")) return <Navigate to="/akun-saya" replace />;

  return <Navigate to="/" replace />;
}
