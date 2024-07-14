import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ReservationStatus } from 'src/enums/reservation-status.enum';

export class CreateReservationDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  concertId: string;

  @IsEnum(ReservationStatus)
  @IsNotEmpty()
  @ApiProperty({ required: true, default: ReservationStatus.RESERVED })
  status: ReservationStatus;
}
