import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({ example: 'google-id-token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
