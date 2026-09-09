import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type JenisDokumenSiswa = 'rapor' | 'skl' | 'ijazah';

export interface DokumenSiswa {
  id: string;
  jenis: JenisDokumenSiswa;
  nama: string;
  path: string;
  ukuran: number;
  mime: string;
  diunggahPada: string;
  diunggahOleh: string;
}

@Entity('siswa')
export class Siswa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  ownerUserId!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  namaLengkap!: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  jurusan!: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  nisn!: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  nis!: string;

  @Column({ type: 'varchar', length: 20, default: '' })
  kelas!: string;

  @Column({ type: 'varchar', length: 20, default: '' })
  tanggalLahir!: string;

  @Column({ type: 'text', default: '' })
  alamat!: string;

  @Column({ type: 'varchar', length: 20, default: '' })
  noWaOrtu!: string;

  @Column({ type: 'varchar', length: 20, default: 'aktif' })
  status!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  raporFile!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sklFile!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ijazahFile!: string;

  // Kolom *File di atas hanya menyimpan file terbaru tiap jenis (kompatibilitas lama).
  @Column({ type: 'jsonb', nullable: true })
  dokumen!: DokumenSiswa[] | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}