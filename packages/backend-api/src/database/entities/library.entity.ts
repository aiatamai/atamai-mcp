import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { LibraryVersion } from './library-version.entity';

export enum LibraryEcosystem {
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  GO = 'go',
  RUST = 'rust',
  JAVA = 'java',
  CSHARP = 'csharp',
  RUBY = 'ruby',
}

export enum LibraryReputation {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('libraries')
@Index(['name'], { fulltext: true })
export class Library {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  full_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    enum: LibraryEcosystem,
  })
  ecosystem: LibraryEcosystem;

  @Column({ type: 'varchar', length: 500, nullable: true })
  homepage_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  repository_url: string;

  @Column({ type: 'integer', default: 0 })
  stars: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'integer', default: 0 })
  benchmark_score: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: LibraryReputation.MEDIUM,
    enum: LibraryReputation,
  })
  reputation: LibraryReputation;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_crawled_at: Date;

  // Relations
  @OneToMany(() => LibraryVersion, (version) => version.library, {
    cascade: true,
  })
  versions: LibraryVersion[];
}
