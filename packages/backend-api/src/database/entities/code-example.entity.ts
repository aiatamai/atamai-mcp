import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentationPage } from './documentation-page.entity';
import { LibraryVersion } from './library-version.entity';

@Entity('code_examples')
export class CodeExample {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  documentation_page_id: string;

  @Column({ type: 'uuid' })
  library_version_id: string;

  @Column({ type: 'varchar', length: 50 })
  language: string;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  topics: string[];

  @Column({ type: 'text', nullable: true })
  context: string;

  @Column({ type: 'text', nullable: true })
  file_path: string;

  @Column({ type: 'integer', nullable: true })
  line_number: number;

  @Column({ type: 'tsvector', generatedType: 'STORED', nullable: true })
  search_vector: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => DocumentationPage, (page) => page.code_examples, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'documentation_page_id' })
  documentation_page: DocumentationPage;

  @ManyToOne(() => LibraryVersion, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'library_version_id' })
  library_version: LibraryVersion;
}
