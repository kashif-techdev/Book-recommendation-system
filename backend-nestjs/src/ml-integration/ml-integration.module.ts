import { Module } from '@nestjs/common';
import { MlIntegrationService } from './ml-integration.service';

@Module({
  providers: [MlIntegrationService],
  exports: [MlIntegrationService],
})
export class MlIntegrationModule {}
