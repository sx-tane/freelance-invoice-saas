import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(@Request() req, @Body() searchData: { query: string; filters?: any }) {
    return this.searchService.globalSearch(req.user.id, searchData.query, searchData.filters);
  }
}