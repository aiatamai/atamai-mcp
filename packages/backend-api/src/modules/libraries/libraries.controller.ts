import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LibrariesService } from './libraries.service';
import { SearchLibraryDto } from './dto/search-library.dto';

@ApiTags('Libraries')
@Controller('libraries')
export class LibrariesController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Get()
  @ApiOperation({ summary: 'Search libraries' })
  async search(@Query() searchDto: SearchLibraryDto) {
    return this.librariesService.search(searchDto);
  }

  @Get('ecosystems')
  @ApiOperation({ summary: 'Get all available ecosystems' })
  async getEcosystems() {
    return this.librariesService.getEcosystems();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get library by ID' })
  async findById(@Param('id') id: string) {
    return this.librariesService.findById(id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get library versions' })
  async getVersions(@Param('id') id: string) {
    return this.librariesService.findVersions(id);
  }
}
