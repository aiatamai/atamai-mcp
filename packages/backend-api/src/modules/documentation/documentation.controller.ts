import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentationService } from './documentation.service';
import { GetDocsDto } from './dto/get-docs.dto';

@ApiTags('Documentation')
@Controller('docs')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Post('resolve')
  @ApiOperation({ summary: 'Resolve library ID from name' })
  async resolveLibrary(@Body() _body: { libraryName: string }) {
    // This will be implemented in the MCP server
    // For now, just return placeholder
    return { message: 'Resolve library endpoint' };
  }

  @Get(':libraryId')
  @ApiOperation({ summary: 'Get documentation for a library' })
  async getDocs(@Param('libraryId') libraryId: string, @Query() getDocsDto: GetDocsDto) {
    return this.documentationService.getDocs(libraryId, getDocsDto);
  }

  @Get('search/:query')
  @ApiOperation({ summary: 'Search documentation' })
  async search(
    @Param('query') query: string,
    @Query('page') page: number = 1,
  ) {
    return this.documentationService.search(query, page);
  }
}
