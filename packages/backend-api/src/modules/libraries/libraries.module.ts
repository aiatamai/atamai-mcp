import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Library } from '../../database/entities/library.entity';
import { LibraryVersion } from '../../database/entities/library-version.entity';
import { LibrariesService } from './libraries.service';
import { LibrariesController } from './libraries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Library, LibraryVersion])],
  providers: [LibrariesService],
  controllers: [LibrariesController],
  exports: [LibrariesService],
})
export class LibrariesModule {}
