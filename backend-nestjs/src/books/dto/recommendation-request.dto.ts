import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecommendationRequestDto {
  @ApiProperty({ example: 'mystery thriller', required: false })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({ example: 'Fiction', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'Suspenseful', required: false })
  @IsString()
  @IsOptional()
  tone?: string;

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, required: false })
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}
