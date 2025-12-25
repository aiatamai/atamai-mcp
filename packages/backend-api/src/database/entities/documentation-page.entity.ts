import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { LibraryVersion } from './library-version.entity';
import { CodeExample } from './code-example.entity';

export enum SourceType {
  GITHUB = 'github',
  OFFICIAL_DOCS = 'official_docs',
  README = 'readme',
}

export enum ContentType {
  MARKDOWN = 'markdown',
  HTML = 'html',
  CODE = 'code',
}

export enum PageType {
  API = 'api',
  GUIDE = 'guide',
  TUTORIAL = 'tutorial',
  REFERENCE = 'reference',
  EXAMPLE = 'example',
}

@Entity('documentation_pages')
export class DocumentationPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  library_version_id: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: SourceType,
  })
  source_type: SourceType;

  @Column({ type: 'text' })
  source_url: string;

  @Column({ type: 'text', nullable: true })
  path: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: ContentType.MARKDOWN,
    enum: ContentType,
  })
  content_type: ContentType;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    enum: PageType,
  })
  page_type: PageType;

  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  topics: string[];

  @Column({ type: 'integer', default: 0 })
  code_snippets: number;

  @Column({ type: 'tsvector', generatedType: 'STORED', nullable: true })
  search_vector: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => LibraryVersion, (version) => version.documentation_pages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'library_version_id' })
  library_version: LibraryVersion;

  @OneToMany(() => CodeExample, (example) => example.documentation_page, {
    cascade: true,
  })
  code_examples: CodeExample[];
}
