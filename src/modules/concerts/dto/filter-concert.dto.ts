import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/utils/pagination';

export class FilterConcertDto extends PaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description: string;

  @IsInt()
  @IsOptional()
  @ApiProperty()
  seat: number;
}
