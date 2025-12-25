import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { DocumentationPage } from '../../database/entities/documentation-page.entity';
import { CodeExample } from '../../database/entities/code-example.entity';
import { LibraryVersion } from '../../database/entities/library-version.entity';
import { LibrariesService } from '../libraries/libraries.service';
import { GetDocsDto } from './dto/get-docs.dto';

@Injectable()
export class DocumentationService {
  constructor(
    @InjectRepository(DocumentationPage)
    private readonly docPageRepository: Repository<DocumentationPage>,
    @InjectRepository(CodeExample)
    private readonly codeExampleRepository: Repository<CodeExample>,
    @InjectRepository(LibraryVersion)
    private readonly libraryVersionRepository: Repository<LibraryVersion>,
    private readonly librariesService: LibrariesService,
  ) {}

  async getDocs(libraryId: string, getDocsDto: GetDocsDto) {
    // Parse library ID (format: /org/project or /org/project/version)
    const parts = libraryId.split('/').filter((p) => p);

    if (parts.length < 2) {
      throw new NotFoundException('Invalid library ID format');
    }

    const fullName = `${parts[0]}/${parts[1]}`;
    const requestedVersion = parts[2];

    // Get library
    const library = await this.librariesService.findByFullName(fullName);

    // Get version
    let version: LibraryVersion;
    if (requestedVersion) {
      version = await this.libraryVersionRepository.findOne({
        where: {
          library_id: library.id,
          version: requestedVersion,
        },
      });
    } else {
      version = await this.librariesService.findLatestVersion(library.id);
    }

    if (!version) {
      throw new NotFoundException('Library version not found');
    }

    // Build query
    const where: any = { library_version_id: version.id };
    if (getDocsDto.topic) {
      where.topics = () => `topics @> ARRAY['${getDocsDto.topic}']`;
    }

    const limit = 10;
    const page = getDocsDto.page || 1;

    // Get documentation pages
    const [pages, total] = await this.docPageRepository.findAndCount({
      where,
      relations: ['code_examples'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });

    // Format response
    const documentation = pages.map((page) => ({
      id: page.id,
      title: page.title,
      type: page.page_type,
      content: page.content,
      topics: page.topics,
      source_url: page.source_url,
      source_type: page.source_type,
      codeExamples: page.code_examples?.map((example) => ({
        id: example.id,
        language: example.language,
        code: example.code,
        description: example.description,
      })),
    }));

    return {
      libraryId,
      library: {
        name: library.name,
        full_name: library.full_name,
        ecosystem: library.ecosystem,
      },
      version: version.version,
      topic: getDocsDto.topic,
      mode: getDocsDto.mode,
      page: page,
      totalPages: Math.ceil(total / limit),
      documentation,
    };
  }

  async search(query: string, page: number = 1, limit: number = 20) {
    const [results, total] = await this.docPageRepository.findAndCount({
      where: { title: ILike(`%${query}%`) },
      relations: ['library_version', 'library_version.library'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCodeExamples(libraryVersionId: string, language?: string, page: number = 1) {
    const limit = 20;

    const where: any = { library_version_id: libraryVersionId };
    if (language) {
      where.language = language;
    }

    const [examples, total] = await this.codeExampleRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });

    return {
      examples,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
