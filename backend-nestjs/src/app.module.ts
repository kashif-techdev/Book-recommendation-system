import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { SearchHistoryModule } from './search-history/search-history.module';
import { MlIntegrationModule } from './ml-integration/ml-integration.module';
import { DatabaseConfig } from './config/database.config';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database module
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    BooksModule,
    SearchHistoryModule,
    MlIntegrationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
