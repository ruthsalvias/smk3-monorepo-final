import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('siswa')
export class Siswa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nama_lengkap', length: 255 })
  namaLengkap!: string;

  @Column({ name: 'jurusan', length: 100 })
  jurusan!: string;

  @Column({ name: 'nisn', length: 50 })
  nisn!: string;

  @Column({ name: 'nis', length: 50 })
  nis!: string;

  @Column({ name: 'kelas', length: 20 })
  kelas!: string;

  @Column({ name: 'tanggal_lahir', length: 20 })
  tanggalLahir!: string;

  @Column({ name: 'alamat', type: 'text' })
  alamat!: string;

  @Column({ name: 'no_wa_ortu', length: 20 })
  noWaOrtu!: string;

  @Column({ name: 'status', length: 20, default: 'aktif' })
  status!: string; // aktif / lulus / nonaktif

  // Dokumen Siswa
  @Column({ name: 'rapor_file', type: 'varchar', length: 255, nullable: true })
  raporFile!: string | null;

  @Column({ name: 'skl_file', type: 'varchar', length: 255, nullable: true })
  sklFile!: string | null;

  @Column({ name: 'ijazah_file', type: 'varchar', length: 255, nullable: true })
  ijazahFile!: string | null;
}
