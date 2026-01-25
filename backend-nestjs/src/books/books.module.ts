import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { MlIntegrationModule } from '../ml-integration/ml-integration.module';
import { SearchHistoryModule } from '../search-history/search-history.module';

@Module({
  imports: [MlIntegrationModule, SearchHistoryModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
