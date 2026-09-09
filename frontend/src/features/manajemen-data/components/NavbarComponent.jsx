import { NavLink } from "react-router-dom";
import { adminPath } from "../../../config/adminPath";
import { useState } from "react";

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <header className="smk-navbar">
      <div className="smk-nav-inner">
        {/* Logo */}
        <div className="smk-nav-logo">
          <div className="smk-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 9L12 15L22 9L12 3Z" fill="white" />
              <path d="M2 15L12 21L22 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="smk-logo-text">
            <strong>SMK NEGERI 3 BALIGE</strong>
            <span>Excellence in Education</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="smk-nav-menu">
          <NavLink to="/" className={({ isActive }) => `smk-nav-item${isActive ? " smk-nav-active" : ""}`}>
            Beranda
          </NavLink>

          <div className="smk-nav-dropdown">
            <NavLink
              to="/berita"
              className={({ isActive }) => `smk-nav-item${isActive ? " smk-nav-active" : ""}`}
              onClick={() => toggleDropdown("berita")}
            >
              Berita &amp; Informasi <span className="smk-caret">▾</span>
            </NavLink>
            <div className="smk-dropdown-menu">
              <NavLink to="/berita" className="smk-dropdown-item">Pengumuman</NavLink>
              <NavLink to="/berita" className="smk-dropdown-item">Kegiatan Sekolah</NavLink>
            </div>
          </div>

          <div className="smk-nav-dropdown">
            <NavLink
              to="/profil"
              className={({ isActive }) => `smk-nav-item${isActive ? " smk-nav-active" : ""}`}
            >
              Profil Sekolah <span className="smk-caret">▾</span>
            </NavLink>
            <div className="smk-dropdown-menu">
              <NavLink to="/profil" className="smk-dropdown-item">Sejarah &amp; Identitas</NavLink>
              <NavLink to="/profil" className="smk-dropdown-item">Visi &amp; Misi</NavLink>
              <NavLink to="/profil" className="smk-dropdown-item">Struktur Organisasi</NavLink>
            </div>
          </div>

          <div className="smk-nav-dropdown">
            <NavLink
              to="/portofolio"
              className={({ isActive }) => `smk-nav-item${isActive ? " smk-nav-active" : ""}`}
            >
              Portofolio &amp; Skill <span className="smk-caret">▾</span>
            </NavLink>
            <div className="smk-dropdown-menu">
              <NavLink to="/portofolio" className="smk-dropdown-item">Karya Siswa</NavLink>
              <NavLink to="/portofolio" className="smk-dropdown-item">Kompetensi</NavLink>
            </div>
          </div>

          {/*DATA*/}
          <div className="smk-nav-dropdown">
            <NavLink
              to="#"
              className="smk-nav-item"
              onClick={() => toggleDropdown("data")}
            >
              Data <span className="smk-caret">▾</span>
            </NavLink>

            <div className="smk-dropdown-menu">
              <NavLink to={adminPath("/data/siswa")} className="smk-dropdown-item">
                Data Siswa
              </NavLink>

              <NavLink to={adminPath("/data/guru")} className="smk-dropdown-item">
                Data Guru/Staf
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Login */}
        <button className="smk-btn-login">LOGIN</button>
      </div>
    </header>
  );
}
