import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('guru')
export class Guru {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nama_lengkap', length: 255 })
  namaLengkap!: string;

  @Column({ name: 'nip', length: 50 })
  nip!: string;

  @Column({ name: 'no_telepon', length: 20 })
  noTelepon!: string;

  @Column({ name: 'anak_wali', length: 255 })
  anakWali!: string;

  @Column({ name: 'mata_pelajaran', length: 100 })
  mataPelajaran!: string;

  @Column({ name: 'alamat', type: 'text' })
  alamat!: string;

  @Column({ name: 'jabatan', length: 255 })
  jabatan!: string;
}
