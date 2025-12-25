import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { LibrariesModule } from './modules/libraries/libraries.module';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { RateLimitingModule } from './modules/rate-limiting/rate-limiting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RateLimitingModule,
    AuthModule,
    LibrariesModule,
    DocumentationModule,
  ],
})
export class AppModule {}
