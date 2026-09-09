import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../../../components/Icon";
import "./RowActionMenu.css";

const LEBAR_MENU = 160;

// Dropdown dirender lewat portal supaya tidak terpotong overflow container tabel.
export default function RowActionMenu({ onDetail, onEdit, onDelete, items }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const tinggiMenu = menuRef.current?.offsetHeight || 130;
    const ruangBawah = window.innerHeight - rect.bottom;
    setCoords({
      top: ruangBawah < tinggiMenu + 12 ? rect.top - tinggiMenu - 6 : rect.bottom + 6,
      left: Math.max(8, rect.right - LEBAR_MENU),
    });
  }, [open]);

  const daftar = items || [
    { label: "Lihat Detail", icon: "eye", onClick: onDetail },
    { label: "Edit Data", icon: "edit", onClick: onEdit },
    { pemisah: true },
    { label: "Hapus", icon: "trash", onClick: onDelete, bahaya: true },
  ];

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="btn-kebab"
        title="Menu aksi"
        aria-label="Menu aksi"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        &#8942;
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="row-action-menu"
          style={{ top: coords.top, left: coords.left, width: LEBAR_MENU }}
        >
          {daftar.map((aksi, i) =>
            aksi.pemisah ? (
              <div key={`sep-${i}`} className="row-action-sep" />
            ) : (
              <button
                key={aksi.label}
                type="button"
                role="menuitem"
                className={aksi.bahaya ? "hapus" : undefined}
                onClick={() => { aksi.onClick(); setOpen(false); }}
              >
                <Icon name={aksi.icon} size={15} /> {aksi.label}
              </button>
            )
          )}
        </div>,
        document.body
      )}
    </>
  );
}
