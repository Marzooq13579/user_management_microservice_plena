import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiPropertyOptional({
    description: 'Username to search for',
    example: 'johndoe',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Minimum age of the users to search for',
    example: 18,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAge?: number;

  @ApiPropertyOptional({
    description: 'Maximum age of the users to search for',
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(150)
  maxAge?: number;
}
