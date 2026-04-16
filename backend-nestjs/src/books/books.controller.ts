import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { BooksService } from './books.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('recommend')
  @ApiOperation({ summary: 'Get book recommendations' })
  async recommend(
    @Body() requestDto: RecommendationRequestDto,
    @Request() req,
  ) {
    // Public endpoint: parse JWT token optionally so logged-in users still get history saved.
    let userId: number | undefined;
    const authHeader = req.headers?.authorization as string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.verify(token) as { sub?: number };
        if (payload?.sub) {
          userId = payload.sub;
        }
      } catch {
        // Ignore invalid token and continue as guest request.
      }
    }

    return this.booksService.getRecommendations(
      {
        query: requestDto.query || '',
        category: requestDto.category || 'All',
        tone: requestDto.tone || 'All',
        limit: requestDto.limit || 10,
      },
      userId,
    );
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular books' })
  async getPopular() {
    return this.booksService.getPopularBooks();
  }
}
