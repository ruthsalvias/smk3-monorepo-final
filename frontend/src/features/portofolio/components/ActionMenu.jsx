import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../components/Icon';

/**
 * ActionMenu — titik tiga (⋮) dengan dropdown Edit & Hapus.
 * Dropdown dirender via portal ke document.body dengan posisi `fixed`,
 * sehingga tidak pernah kepotong oleh overflow:hidden pada container tabel,
 * dan otomatis "flip" ke atas kalau tempat di bawah tidak cukup.
 */
function ActionMenu({ canEdit, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUp: false });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Tutup menu saat klik di luar (baik di tombol maupun di dropdown portal)
  useEffect(() => {
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Tutup menu saat scroll/resize supaya posisi tidak "nyasar"
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  // Hitung posisi dropdown relatif terhadap tombol, setiap kali dibuka
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || 160;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 12;

    setCoords({
      top: openUp ? rect.top - menuHeight - 6 : rect.bottom + 6,
      left: rect.right - 150, // lebar minWidth menu = 150
      openUp,
    });
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '20px', color: '#6b7280', padding: '4px 8px',
          borderRadius: '6px', lineHeight: 1, transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        ⋮
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed', top: coords.top, left: coords.left,
            backgroundColor: 'white', border: '1px solid #e5e7eb',
            borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 1000, minWidth: '150px', overflow: 'hidden',
          }}
        >
          <MenuItem icon={<Icon name="eye" size={15} />} label="Lihat Detail" color="#374151" hoverBg="#f9fafb"
            onClick={() => { onView(); setOpen(false); }} />

          {canEdit ? (
            <>
              <MenuItem icon={<Icon name="edit" size={15} />} label="Edit Karya" color="#374151" hoverBg="#f9fafb"
                onClick={() => { onEdit(); setOpen(false); }} />
              <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '2px 0' }} />
              <MenuItem icon={<Icon name="trash" size={15} />} label="Hapus" color="#dc2626" hoverBg="#fef2f2"
                onClick={() => { onDelete(); setOpen(false); }} />
            </>
          ) : (
            <div style={{
              padding: '10px 16px', fontSize: '12px', color: '#9ca3af',
              display: 'flex', alignItems: 'center', gap: '6px',
              borderTop: '1px solid #f3f4f6',
            }}>
              <Icon name="shield" size={14} /> Bukan karya kamu
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

function MenuItem({ icon, label, color, hoverBg, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 16px', cursor: 'pointer', fontSize: '13px', color,
        display: 'flex', alignItems: 'center', gap: '8px',
        backgroundColor: hovered ? hoverBg : 'transparent', transition: 'background 0.1s',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      {label}
    </div>
  );
}

export default ActionMenu;