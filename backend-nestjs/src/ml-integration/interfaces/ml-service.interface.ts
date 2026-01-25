export interface BookRecommendationRequest {
  query: string;
  category: string;
  tone: string;
  limit: number;
}

export interface BookResponse {
  isbn13: string;
  title: string;
  authors: string;
  thumbnail: string;
  description: string;
  simple_categories: string;
  published_year?: number;
  average_rating?: number;
  num_pages?: number;
  ratings_count?: number;
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
}

export interface RecommendationResponse {
  success: boolean;
  data: {
    books: BookResponse[];
    total: number;
  };
  message: string;
}
