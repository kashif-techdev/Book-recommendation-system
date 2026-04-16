import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('recommend')
  @ApiOperation({ summary: 'Get book recommendations' })
  async recommend(
    @Body() requestDto: RecommendationRequestDto,
    @Request() req,
  ) {
    return this.booksService.getRecommendations(
      {
        query: requestDto.query || '',
        category: requestDto.category || 'All',
        tone: requestDto.tone || 'All',
        limit: requestDto.limit || 10,
      },
      req.user?.id,
    );
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular books' })
  async getPopular() {
    return this.booksService.getPopularBooks();
  }
}
