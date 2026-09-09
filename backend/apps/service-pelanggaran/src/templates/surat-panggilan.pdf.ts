import PDFDocument from 'pdfkit';

export type PenandatanganPdf = {
  nama?: string;
  nip?: string;
  jabatan?: string;
};

export type SuratPdfData = {
  no_surat: string;
  nama_siswa: string;
  kelas?: string;
  tanggal_panggilan: string;
  waktu_panggilan: string;
  tempat: string;
  permasalahan: string;
  penandatangan: PenandatanganPdf[];
  sekolah: {
    nama: string;
    dinas: string;
    pemerintah: string;
    alamat: string;
    kontak: string;
    kota: string;
  };
};

const NAVY = '#1b2a5b';
const GOLD = '#c8a24a';
const TEXT = '#111827';
const MUTED = '#4b5563';

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatTanggal(value: string): string {
  const d = parseDate(value);
  if (!d) return value || '-';
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatHariTanggal(value: string): string {
  const d = parseDate(value);
  if (!d) return value || '-';
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function buildSuratPanggilanPdf(data: SuratPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 48, bottom: 56, left: 62, right: 62 },
      info: {
        Title: `Surat Panggilan Orang Tua - ${data.nama_siswa}`,
        Author: data.sekolah.nama,
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;

    /* ── KOP SURAT ── */
    doc.fillColor(NAVY).font('Helvetica').fontSize(12)
      .text(data.sekolah.pemerintah.toUpperCase(), left, 48, { width, align: 'center' });
    doc.fontSize(13).text(data.sekolah.dinas.toUpperCase(), { width, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(18)
      .text(data.sekolah.nama.toUpperCase(), { width, align: 'center' });
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
      .text(data.sekolah.alamat, { width, align: 'center' })
      .text(data.sekolah.kontak, { width, align: 'center' });

    let y = doc.y + 8;
    doc.lineWidth(2.4).strokeColor(NAVY).moveTo(left, y).lineTo(right, y).stroke();
    doc.lineWidth(0.9).strokeColor(GOLD).moveTo(left, y + 3.6).lineTo(right, y + 3.6).stroke();

    /* ── JUDUL ── */
    doc.y = y + 20;
    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(12.5)
      .text('SURAT PANGGILAN ORANG TUA / WALI SISWA', { width, align: 'center' });
    const titleWidth = doc.widthOfString('SURAT PANGGILAN ORANG TUA / WALI SISWA');
    const titleY = doc.y + 1;
    doc.lineWidth(0.8).strokeColor(TEXT)
      .moveTo(left + (width - titleWidth) / 2, titleY)
      .lineTo(left + (width + titleWidth) / 2, titleY)
      .stroke();

    doc.font('Helvetica').fontSize(9.5).fillColor(MUTED)
      .text(`Nomor: ${data.no_surat}`, left, titleY + 6, { width, align: 'center' });

    /* ── TUJUAN ── */
    doc.moveDown(1.4);
    doc.fillColor(TEXT).font('Helvetica').fontSize(10.5);
    doc.text('Kepada Yth.', left, doc.y);
    doc.text('Bapak/Ibu Orang Tua / Wali dari siswa:', left);

    const boxTop = doc.y + 6;
    const rows: [string, string][] = [
      ['Nama Siswa', data.nama_siswa || '-'],
      ['Kelas', data.kelas || '-'],
    ];
    const boxHeight = rows.length * 18 + 12;
    doc.roundedRect(left, boxTop, width, boxHeight, 4)
      .fillAndStroke('#f6f8fc', '#d8dfec');

    let ry = boxTop + 9;
    for (const [label, value] of rows) {
      doc.fillColor(MUTED).font('Helvetica').fontSize(10).text(label, left + 14, ry, { width: 100 });
      doc.fillColor(TEXT).text(':', left + 114, ry, { width: 8 });
      doc.font('Helvetica-Bold').text(value, left + 126, ry, { width: width - 140 });
      ry += 18;
    }
    doc.y = boxTop + boxHeight + 6;
    doc.fillColor(TEXT).font('Helvetica').fontSize(10.5).text('di Tempat', left, doc.y);

    /* ── ISI ── */
    doc.moveDown(1);
    doc.text('Dengan hormat,', left);
    doc.moveDown(0.4);
    doc.text(
      'Sehubungan dengan adanya permasalahan yang menyangkut putra/putri Bapak/Ibu di lingkungan ' +
        `${data.sekolah.nama}, dengan ini kami mengharapkan kehadiran Bapak/Ibu pada:`,
      left,
      doc.y,
      { width, align: 'justify', lineGap: 2.5 },
    );

    doc.moveDown(0.8);
    const detail: [string, string][] = [
      ['Hari / Tanggal', formatHariTanggal(data.tanggal_panggilan)],
      ['Waktu', data.waktu_panggilan || '-'],
      ['Tempat', data.tempat || '-'],
      ['Keperluan', 'Pembinaan dan penyelesaian permasalahan siswa'],
    ];
    for (const [label, value] of detail) {
      const rowY = doc.y;
      doc.font('Helvetica').fillColor(MUTED).text(label, left + 18, rowY, { width: 110 });
      doc.fillColor(TEXT).text(':', left + 128, rowY, { width: 8 });
      doc.font('Helvetica-Bold').text(value, left + 140, rowY, { width: width - 158 });
      doc.moveDown(0.25);
    }

    /* ── PERMASALAHAN ── */
    doc.moveDown(0.8);
    doc.font('Helvetica-Bold').fillColor(NAVY).fontSize(10.5).text('Uraian Permasalahan', left, doc.y);
    doc.moveDown(0.3);

    const permasalahan = (data.permasalahan || '-').trim();
    const textHeight = doc.font('Helvetica').fontSize(10.5)
      .heightOfString(permasalahan, { width: width - 28, align: 'justify', lineGap: 2.5 });
    const pTop = doc.y;
    doc.roundedRect(left, pTop, width, textHeight + 20, 4).fillAndStroke('#fffaf0', GOLD);
    doc.fillColor(TEXT).font('Helvetica').fontSize(10.5)
      .text(permasalahan, left + 14, pTop + 10, { width: width - 28, align: 'justify', lineGap: 2.5 });
    doc.y = pTop + textHeight + 26;

    /* ── PENUTUP ── */
    doc.fillColor(TEXT).font('Helvetica').fontSize(10.5).text(
      'Mengingat pentingnya acara tersebut, kami mohon Bapak/Ibu dapat hadir tepat waktu dan tidak ' +
        'diwakilkan. Demikian surat ini kami sampaikan, atas perhatian dan kerja sama Bapak/Ibu kami ' +
        'ucapkan terima kasih.',
      left,
      doc.y,
      { width, align: 'justify', lineGap: 2.5 },
    );

    /* ── TANDA TANGAN ── */
    const signers = data.penandatangan.length ? data.penandatangan : [{ nama: '', jabatan: '', nip: '' }];
    const blockHeight = 118;
    if (doc.y + blockHeight > doc.page.height - doc.page.margins.bottom) doc.addPage();

    const tglCetak = `${data.sekolah.kota}, ${formatTanggal(new Date().toISOString())}`;
    doc.moveDown(1.4);
    doc.font('Helvetica').fontSize(10.5)
      .text(tglCetak, left + width / 2, doc.y, { width: width / 2, align: 'center' });

    const signTop = doc.y + 6;
    const colCount = Math.min(signers.length, 3);
    const colWidth = width / colCount;

    signers.slice(0, 3).forEach((signer, i) => {
      const x = left + i * colWidth;
      doc.font('Helvetica').fontSize(10.5).fillColor(MUTED)
        .text(signer.jabatan || 'Penanggung Jawab', x, signTop, { width: colWidth, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(TEXT)
        .text(signer.nama || '..............................', x, signTop + 62, {
          width: colWidth,
          align: 'center',
          underline: true,
        });
      doc.font('Helvetica').fontSize(9.5).fillColor(MUTED)
        .text(signer.nip ? `NIP. ${signer.nip}` : 'NIP. -', x, signTop + 78, {
          width: colWidth,
          align: 'center',
        });
    });

    /* ── CATATAN KAKI ── */
    const footY = doc.page.height - doc.page.margins.bottom + 14;
    doc.lineWidth(0.6).strokeColor('#d8dfec').moveTo(left, footY - 8).lineTo(right, footY - 8).stroke();
    doc.font('Helvetica').fontSize(7.5).fillColor('#9aa3b2')
      .text(
        `Dokumen ini diterbitkan oleh sistem informasi ${data.sekolah.nama} — ${data.no_surat}`,
        left,
        footY,
        { width, align: 'center' },
      );

    doc.end();
  });
}
