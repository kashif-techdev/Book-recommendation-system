import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { MlIntegrationModule } from '../ml-integration/ml-integration.module';
import { SearchHistoryModule } from '../search-history/search-history.module';

@Module({
  imports: [
    MlIntegrationModule,
    SearchHistoryModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
