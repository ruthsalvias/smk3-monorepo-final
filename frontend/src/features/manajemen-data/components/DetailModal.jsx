import Icon from "../../../components/Icon";

export default function DetailModal({ title, subtitle, fields, onClose, onEdit }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon"><Icon name="shield" size={26} /></div>
        <h2 className="modal-title">{title}</h2>
        {subtitle && <p className="modal-desc">{subtitle}</p>}

        <dl className="detail-grid">
          {fields.map(({ label, value }) => (
            <div className="detail-row" key={label}>
              <dt>{label}</dt>
              <dd>{value || value === 0 ? value : "-"}</dd>
            </div>
          ))}
        </dl>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Tutup</button>
          {onEdit && (
            <button onClick={onEdit} className="btn-warning">
              Edit Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
