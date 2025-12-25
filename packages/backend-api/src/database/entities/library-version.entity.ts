import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Library } from './library.entity';
import { DocumentationPage } from './documentation-page.entity';

export enum DocumentationStatus {
  PENDING = 'pending',
  CRAWLING = 'crawling',
  INDEXED = 'indexed',
  FAILED = 'failed',
}

@Entity('library_versions')
export class LibraryVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  library_id: string;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  git_tag: string;

  @Column({ type: 'boolean', default: false })
  is_latest: boolean;

  @Column({ type: 'timestamp', nullable: true })
  release_date: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: DocumentationStatus.PENDING,
    enum: DocumentationStatus,
  })
  documentation_status: DocumentationStatus;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Library, (library) => library.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'library_id' })
  library: Library;

  @OneToMany(() => DocumentationPage, (page) => page.library_version, {
    cascade: true,
  })
  documentation_pages: DocumentationPage[];
}
