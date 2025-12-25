import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentationPage } from '../../database/entities/documentation-page.entity';
import { CodeExample } from '../../database/entities/code-example.entity';
import { LibraryVersion } from '../../database/entities/library-version.entity';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';
import { LibrariesModule } from '../libraries/libraries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentationPage, CodeExample, LibraryVersion]),
    LibrariesModule,
  ],
  providers: [DocumentationService],
  controllers: [DocumentationController],
  exports: [DocumentationService],
})
export class DocumentationModule {}
