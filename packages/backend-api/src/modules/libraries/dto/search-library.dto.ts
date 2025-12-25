import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchLibraryDto {
  @ApiProperty({ example: 'react', required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ example: 'javascript', required: false })
  @IsOptional()
  @IsString()
  ecosystem?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
