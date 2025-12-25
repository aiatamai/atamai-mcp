import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetDocsDto {
  @ApiProperty({ example: 'react', required: false })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  page?: number = 1;

  @ApiProperty({ example: 'code', enum: ['code', 'info'], required: false })
  @IsOptional()
  @IsString()
  mode?: 'code' | 'info' = 'code';
}
