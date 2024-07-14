import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ required: false })
  @Transform(({ value }) => value && parseInt(value))
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number = 1;

  @ApiProperty({ required: false })
  @Transform(({ value }) => value && parseInt(value))
  @IsNumber()
  @IsOptional()
  @Min(1)
  pageSize: number = 10;
}

interface PaginationMetadata {
  itemCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface Pagination<T> {
  data: T[];
  metadata: PaginationMetadata;
}

export function toPagination<T>(
  data: T[],
  totalCount: number,
  page: number,
  pageSize: number,
): Pagination<T> {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    data,
    metadata: {
      itemCount: data.length,
      page,
      pageSize,
      totalPages,
      totalCount,
    },
  };
}
