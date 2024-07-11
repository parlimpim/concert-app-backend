import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenAuthGuard } from '../auth/guards/access-token.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { ReservationStatus } from 'src/enums/reservation-status.enum';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { PaginationDto } from 'src/utils/pagination';

@ApiTags('reservations')
@UseGuards(AccessTokenAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @HttpCode(200)
  @Roles(Role.USER)
  @Post()
  @ApiResponse({
    status: 200,
    description: 'Reserve or cancel the concert successful',
  })
  @ApiResponse({
    status: 404,
    description:
      "Not found concert or user try to cancel a reservation that they haven't made yet",
  })
  @ApiResponse({
    status: 400,
    description:
      "Don't have available seats or user try to reserve a concert that they have already reserved",
  })
  async reserve(
    @Request() req,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    const userId = req.user['sub'];
    await this.reservationsService.create(userId, createReservationDto);
    let message: string;
    if (createReservationDto.status === ReservationStatus.RESERVED) {
      message = 'The concert reservation was successful.';
    } else {
      message = 'The concert has been successfully canceled.';
    }
    return { message };
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'userName', required: false, type: String })
  @ApiQuery({ name: 'userEmail', required: false, type: String })
  @ApiQuery({ name: 'concertName', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ReservationStatus })
  async findAll(
    @Request() req,
    @Query() filterReservationDto: FilterReservationDto,
  ) {
    const userId = req.user['sub'];
    const role = req.user['role'];
    return await this.reservationsService.findAll(
      userId,
      role,
      filterReservationDto,
    );
  }

  // @Roles(Role.USER)
  // @Get('reserved')
  // async findReserved(@Request() req, @Query() paginationDto: PaginationDto) {
  //   const userId = req.user["sub"];
  //   return await this.reservationsService.findReserved(userId, paginationDto.page, paginationDto.pageSize);
  //   // have 1 query: isReserved, get only reserved concert
  // }
}
