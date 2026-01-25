import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchHistoryService } from './search-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search-history')
@Controller('search-history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchHistoryController {
  constructor(
    private readonly searchHistoryService: SearchHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user search history' })
  async getHistory(@Request() req) {
    const history = await this.searchHistoryService.findByUserId(req.user.id);
    return {
      success: true,
      data: { history },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a search history entry' })
  async deleteHistory(@Param('id') id: number, @Request() req) {
    await this.searchHistoryService.delete(id, req.user.id);
    return {
      success: true,
      message: 'Search history deleted',
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all search history' })
  async deleteAllHistory(@Request() req) {
    await this.searchHistoryService.deleteAll(req.user.id);
    return {
      success: true,
      message: 'All search history deleted',
    };
  }
}
