import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Library } from '../../database/entities/library.entity';
import { LibraryVersion } from '../../database/entities/library-version.entity';
import { SearchLibraryDto } from './dto/search-library.dto';

@Injectable()
export class LibrariesService {
  constructor(
    @InjectRepository(Library)
    private readonly libraryRepository: Repository<Library>,
    @InjectRepository(LibraryVersion)
    private readonly libraryVersionRepository: Repository<LibraryVersion>,
  ) {}

  async search(searchDto: SearchLibraryDto) {
    const { query, ecosystem, page = 1, limit = 20 } = searchDto;

    const where: any = { is_active: true };

    if (query) {
      where.name = ILike(`%${query}%`);
    }

    if (ecosystem) {
      where.ecosystem = ecosystem;
    }

    const [libraries, total] = await this.libraryRepository.findAndCount({
      where,
      order: {
        benchmark_score: 'DESC',
        stars: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['versions'],
    });

    return {
      data: libraries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const library = await this.libraryRepository.findOne({
      where: { id },
      relations: ['versions', 'versions.documentation_pages'],
    });

    if (!library) {
      throw new NotFoundException(`Library with id ${id} not found`);
    }

    return library;
  }

  async findByFullName(fullName: string) {
    const library = await this.libraryRepository.findOne({
      where: { full_name: fullName },
      relations: ['versions'],
    });

    if (!library) {
      throw new NotFoundException(`Library ${fullName} not found`);
    }

    return library;
  }

  async findVersions(libraryId: string) {
    return this.libraryVersionRepository.find({
      where: { library_id: libraryId },
      order: { version: 'DESC' },
    });
  }

  async findLatestVersion(libraryId: string) {
    return this.libraryVersionRepository.findOne({
      where: {
        library_id: libraryId,
        is_latest: true,
      },
    });
  }

  async getEcosystems() {
    const result = await this.libraryRepository
      .createQueryBuilder('library')
      .select('DISTINCT library.ecosystem', 'ecosystem')
      .where('library.is_active = :active', { active: true })
      .getRawMany();

    return result.map((r) => r.ecosystem);
  }
}
