import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MlIntegrationService } from '../ml-integration/ml-integration.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private mlIntegrationService: MlIntegrationService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async healthCheck() {
    const mlServiceHealthy = await this.mlIntegrationService.healthCheck();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        mlService: mlServiceHealthy ? 'healthy' : 'unhealthy',
      },
    };
  }
}
