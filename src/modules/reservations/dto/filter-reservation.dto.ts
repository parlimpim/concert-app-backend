import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReservationStatus } from 'src/enums/reservation-status.enum';
import { PaginationDto } from 'src/utils/pagination';

export class FilterReservationDto extends PaginationDto {
  @IsString()
  @IsOptional()
  userName: string;

  @IsString()
  @IsOptional()
  userEmail: string;

  @IsString()
  @IsOptional()
  concertName: string;

  @IsEnum(ReservationStatus)
  @IsOptional()
  status: ReservationStatus;
}
