import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from './entities/search-history.entity';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
  ) {}

  async create(searchData: Partial<SearchHistory>): Promise<SearchHistory> {
    const searchHistory = this.searchHistoryRepository.create(searchData);
    return this.searchHistoryRepository.save(searchHistory);
  }

  async findByUserId(userId: number): Promise<SearchHistory[]> {
    return this.searchHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50 searches
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.searchHistoryRepository.delete({ id, userId });
  }

  async deleteAll(userId: number): Promise<void> {
    await this.searchHistoryRepository.delete({ userId });
  }
}
