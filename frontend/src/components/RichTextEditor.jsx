import { useEffect, useMemo, useRef, useState } from "react";

const COLORS = [
  { label: "Hitam", value: "#111827" },
  { label: "Navy", value: "#1b2a5b" },
  { label: "Merah", value: "#c0392b" },
  { label: "Hijau", value: "#1e7a46" },
  { label: "Biru", value: "#1b4f9b" },
  { label: "Emas", value: "#b1740f" },
  { label: "Abu", value: "#6b7280" },
];

const BLOCKS = [
  { label: "Paragraf", value: "P" },
  { label: "Judul Besar", value: "H2" },
  { label: "Judul Kecil", value: "H3" },
  { label: "Kutipan", value: "BLOCKQUOTE" },
];

/**
 * Editor teks sederhana tanpa dependensi tambahan.
 * Menghasilkan HTML lewat onChange dan sudah dibersihkan dari script/atribut event.
 */
export function sanitizeHtml(html) {
  if (!html) return "";
  if (typeof window === "undefined") return html;

  const holder = document.createElement("div");
  holder.innerHTML = html;

  holder.querySelectorAll("script, style, iframe, object, embed, link, meta").forEach((el) => el.remove());

  holder.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    });
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });

  return holder.innerHTML;
}

function ToolbarButton({ title, onAction, active, children }) {
  return (
    <button
      type="button"
      className={`smk-rte-btn${active ? " is-active" : ""}`}
      title={title}
      aria-label={title}
      onMouseDown={(event) => {
        event.preventDefault();
        onAction();
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value = "", onChange, placeholder = "Tulis isi berita di sini..." }) {
  const editorRef = useRef(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Sinkronisasi nilai dari luar hanya bila berbeda, supaya kursor tidak melompat.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
    setIsEmpty(!el.textContent.trim() && !el.querySelector("img"));
  }, [value]);

  const emit = () => {
    const el = editorRef.current;
    if (!el) return;
    setIsEmpty(!el.textContent.trim() && !el.querySelector("img"));
    onChange?.(sanitizeHtml(el.innerHTML));
  };

  const exec = (command, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const applyBlock = (tag) => exec("formatBlock", `<${tag}>`);

  const applyLink = () => {
    const url = window.prompt("Masukkan URL tautan (contoh: https://smkn3balige.sch.id)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      window.alert("Gunakan tautan yang diawali http:// atau https://");
      return;
    }
    exec("createLink", url);
  };

  const toolbar = useMemo(
    () => [
      { title: "Tebal (Bold)", command: "bold", label: <strong>B</strong> },
      { title: "Miring (Italic)", command: "italic", label: <em>I</em> },
      { title: "Garis Bawah (Underline)", command: "underline", label: <u>U</u> },
      { title: "Coret (Strikethrough)", command: "strikeThrough", label: <s>S</s> },
    ],
    []
  );

  return (
    <div className="smk-rte">
      <div className="smk-rte-toolbar">
        <select
          className="smk-rte-select"
          defaultValue="P"
          onChange={(event) => applyBlock(event.target.value)}
          title="Gaya paragraf"
        >
          {BLOCKS.map((block) => (
            <option key={block.value} value={block.value}>
              {block.label}
            </option>
          ))}
        </select>

        <span className="smk-rte-divider" />

        {toolbar.map((item) => (
          <ToolbarButton key={item.command} title={item.title} onAction={() => exec(item.command)}>
            {item.label}
          </ToolbarButton>
        ))}

        <span className="smk-rte-divider" />

        <div className="smk-rte-color">
          <ToolbarButton title="Warna teks" onAction={() => setColorOpen((prev) => !prev)}>
            <span className="smk-rte-color-icon">A</span>
          </ToolbarButton>
          {colorOpen && (
            <div className="smk-rte-color-menu">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  className="smk-rte-swatch"
                  style={{ background: color.value }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    exec("foreColor", color.value);
                    setColorOpen(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <span className="smk-rte-divider" />

        <ToolbarButton title="Rata kiri" onAction={() => exec("justifyLeft")}>&#8676;</ToolbarButton>
        <ToolbarButton title="Rata tengah" onAction={() => exec("justifyCenter")}>&#8596;</ToolbarButton>
        <ToolbarButton title="Rata kanan" onAction={() => exec("justifyRight")}>&#8677;</ToolbarButton>
        <ToolbarButton title="Rata kanan-kiri" onAction={() => exec("justifyFull")}>&#8801;</ToolbarButton>

        <span className="smk-rte-divider" />

        <ToolbarButton title="Daftar bernomor" onAction={() => exec("insertOrderedList")}>1.</ToolbarButton>
        <ToolbarButton title="Daftar butir" onAction={() => exec("insertUnorderedList")}>&bull;</ToolbarButton>

        <span className="smk-rte-divider" />

        <ToolbarButton title="Sisipkan tautan" onAction={applyLink}>&#128279;</ToolbarButton>
        <ToolbarButton title="Hapus tautan" onAction={() => exec("unlink")}>&#8856;</ToolbarButton>
        <ToolbarButton title="Bersihkan format" onAction={() => exec("removeFormat")}>Tx</ToolbarButton>

        <span className="smk-rte-divider" />

        <ToolbarButton title="Undo" onAction={() => exec("undo")}>&#8630;</ToolbarButton>
        <ToolbarButton title="Redo" onAction={() => exec("redo")}>&#8631;</ToolbarButton>
      </div>

      <div className="smk-rte-surface">
        {isEmpty && <span className="smk-rte-placeholder">{placeholder}</span>}
        <div
          ref={editorRef}
          className="smk-rte-editor smk-richtext"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onInput={emit}
          onBlur={emit}
          onPaste={(event) => {
            // Paste sebagai teks polos agar format dari sumber lain tidak merusak tampilan.
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            emit();
          }}
        />
      </div>
    </div>
  );
}
