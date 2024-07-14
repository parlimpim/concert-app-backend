import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
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

  @Transform(({ value }) => value && parseInt(value))
  @IsInt()
  @IsOptional()
  @ApiProperty()
  @Min(1)
  seat: number;
}
