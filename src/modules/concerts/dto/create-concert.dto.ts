import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

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
  desciption: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ default: 100 })
  total_seats: number;
}
