import Icon from "./Icon";
import "./DaftarDokumen.css";

// Dipakai di halaman guru, akun siswa, dan detail siswa pada panel admin.
export default function DaftarDokumen({
  dokumen = [],
  onLihat,
  onUnduh,
  onHapus,
  onUnggah,
  mengunggah = false,
}) {
  return (
    <div className="dok-sel">
      {dokumen.length === 0 && !onUnggah && <span className="dok-kosong">Belum diunggah</span>}

      {dokumen.map((dok) => (
        <span className="dok-item" key={dok.id}>
          <button
            type="button"
            className="dok-nama"
            title={`Lihat ${dok.nama}`}
            onClick={() => onLihat?.(dok)}
          >
            <Icon name="scroll" size={13} />
            <span>{dok.nama}</span>
          </button>

          {onUnduh && (
            <button type="button" className="dok-ikon" title="Unduh" onClick={() => onUnduh(dok)}>
              <Icon name="download" size={14} />
            </button>
          )}

          {onHapus && (
            <button
              type="button"
              className="dok-ikon bahaya"
              title="Hapus"
              onClick={() => onHapus(dok)}
            >
              <Icon name="trash" size={14} />
            </button>
          )}
        </span>
      ))}

      {onUnggah && (
        <button
          type="button"
          className="dok-tambah"
          title="Unggah file (bisa pilih lebih dari satu)"
          onClick={onUnggah}
          disabled={mengunggah}
        >
          <Icon name={mengunggah ? "clock" : "plus"} size={14} />
        </button>
      )}
    </div>
  );
}
