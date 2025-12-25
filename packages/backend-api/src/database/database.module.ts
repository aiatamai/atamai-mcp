import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '../config/database.config';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { Library } from './entities/library.entity';
import { LibraryVersion } from './entities/library-version.entity';
import { DocumentationPage } from './entities/documentation-page.entity';
import { CodeExample } from './entities/code-example.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    TypeOrmModule.forFeature([
      User,
      ApiKey,
      Library,
      LibraryVersion,
      DocumentationPage,
      CodeExample,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
