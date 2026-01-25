import { Injectable } from '@nestjs/common';
import { MlIntegrationService } from '../ml-integration/ml-integration.service';
import { SearchHistoryService } from '../search-history/search-history.service';

@Injectable()
export class BooksService {
  constructor(
    private mlIntegrationService: MlIntegrationService,
    private searchHistoryService: SearchHistoryService,
  ) {}

  async getRecommendations(request: any, userId: number) {
    // Get recommendations from ML service
    const recommendations =
      await this.mlIntegrationService.getRecommendations(request);

    // Save search history (async, don't wait)
    if (request.query) {
      this.searchHistoryService
        .create({
          userId,
          query: request.query,
          category: request.category,
          tone: request.tone,
          resultsCount: recommendations.data.total,
        })
        .catch((error) => {
          console.error('Failed to save search history:', error);
        });
    }

    return recommendations;
  }

  async getPopularBooks() {
    return this.mlIntegrationService.getRecommendations({
      query: '',
      category: 'All',
      tone: 'All',
      limit: 10,
    });
  }
}
