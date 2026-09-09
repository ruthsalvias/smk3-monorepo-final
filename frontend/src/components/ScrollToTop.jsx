import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ADMIN_PATH } from "../config/adminPath";

/**
 * Halaman publik selalu kembali ke atas saat berpindah route.
 * Panel admin dibiarkan apa adanya supaya posisi scroll sidebar tidak lompat
 * ketika admin mengklik menu di bagian bawah sidebar.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (pathname.startsWith(ADMIN_PATH)) return;
    if (hash) return; // biarkan navigasi anchor (#visi-misi dll) menangani posisinya
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
