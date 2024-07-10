import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  @ApiProperty({ default: 'concert A' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  @ApiProperty({ default: 'Enjoy Christmas vibe at concert' })
  description: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({ default: 100 })
  seat: number;
}
