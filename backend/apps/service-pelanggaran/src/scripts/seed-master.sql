-- Master data referensi untuk fitur surat panggilan (service-pelanggaran).
-- Disamakan dengan data siswa & guru pada service-management.
INSERT INTO m_siswa (id, nama, kelas, no_wa_ortu, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Andreas Sitorus',    'XII KUL 1', '081361234521', NOW(), NOW()),
  (gen_random_uuid(), 'Bunga Simatupang',   'XII KUL 1', '081361234522', NOW(), NOW()),
  (gen_random_uuid(), 'Christian Hutasoit', 'XII PHT 1', '081361234523', NOW(), NOW()),
  (gen_random_uuid(), 'Debora Pasaribu',    'XII PHT 1', '081361234524', NOW(), NOW()),
  (gen_random_uuid(), 'Elisabet Manullang', 'XI KUL 1',  '081361234525', NOW(), NOW()),
  (gen_random_uuid(), 'Fernando Siahaan',   'XI KUL 1',  '081361234526', NOW(), NOW()),
  (gen_random_uuid(), 'Grace Tampubolon',   'XI PHT 1',  '081361234527', NOW(), NOW()),
  (gen_random_uuid(), 'Hendrik Silaban',    'XI PHT 1',  '081361234528', NOW(), NOW()),
  (gen_random_uuid(), 'Indah Butarbutar',   'XI TBS 1',  '081361234529', NOW(), NOW()),
  (gen_random_uuid(), 'Josua Nainggolan',   'X KUL 1',   '081361234530', NOW(), NOW()),
  (gen_random_uuid(), 'Kartika Sihotang',   'X KUL 1',   '081361234531', NOW(), NOW()),
  (gen_random_uuid(), 'Leonardo Simbolon',  'X PHT 1',   '081361234532', NOW(), NOW()),
  (gen_random_uuid(), 'Maria Aritonang',    'X PHT 1',   '081361234533', NOW(), NOW()),
  (gen_random_uuid(), 'Nikson Sinaga',      'X TBS 1',   '081361234534', NOW(), NOW()),
  (gen_random_uuid(), 'Olivia Rajagukguk',  'XI ULP 1',  '081361234535', NOW(), NOW());

INSERT INTO m_guru (id, nama, nip, jabatan, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Marisi Simanjuntak, S.Pd., M.M.', '196804121994031005', 'Kepala Sekolah', NOW(), NOW()),
  (gen_random_uuid(), 'Rospita Sianturi, S.Pd.',         '197505232000122003', 'Wakil Kepala Sekolah Bidang Kurikulum', NOW(), NOW()),
  (gen_random_uuid(), 'Jonner Hutabarat, S.Pd.',         '198002112005011008', 'Wakil Kepala Sekolah Bidang Kesiswaan', NOW(), NOW()),
  (gen_random_uuid(), 'Nurmala Silalahi, S.Pd.',         '199310182016042005', 'Guru Bimbingan Konseling', NOW(), NOW()),
  (gen_random_uuid(), 'Lasma Sitorus, S.Pd.',            '199003222014022001', 'Kepala Program Keahlian Tata Busana', NOW(), NOW()),
  (gen_random_uuid(), 'Ester Situmorang, S.Pd.',         '199501252018012007', 'Kepala Program Keahlian Pariwisata', NOW(), NOW());
