import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus } from 'src/enums/reservation-status.enum';
import { Request } from 'express';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { Role } from 'src/enums/role.enum';
import { Reservation } from './entities/reservation.entity';
import { Concert } from '../concerts/entities/concert.entity';
import { User } from '../users/entities/user.entity';
import { Pagination } from 'src/utils/pagination';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const reservationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: reservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('reserve', () => {
    const userId = uuidv4();
    const req: Partial<Request> = { user: { sub: userId } };

    it('should reserve or cancel a concert successfully', async () => {
      const createReservationDto: CreateReservationDto = {
        concertId: uuidv4(),
        status: ReservationStatus.RESERVED,
      };

      const result = await controller.reserve(req, createReservationDto);

      expect(reservationsService.create).toHaveBeenCalledWith(
        userId,
        createReservationDto,
      );
      expect(result).toEqual({
        message: 'The concert reservation was successful.',
      });
    });

    it('should throw NotFoundException if user try to cancel the unreserved concert', async () => {
      const userId = uuidv4();
      const req: Partial<Request> = { user: { sub: userId } };
      const createReservationDto: CreateReservationDto = {
        concertId: uuidv4(),
        status: ReservationStatus.CANCELED,
      };

      jest
        .spyOn(reservationsService, 'create')
        .mockRejectedValue(
          new NotFoundException(
            'You do not have an active reservation to cancel.',
          ),
        );

      await expect(
        controller.reserve(req, createReservationDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if try to reserve sold out concert', async () => {
      const userId = uuidv4();
      const req: Partial<Request> = { user: { sub: userId } };
      const createReservationDto: CreateReservationDto = {
        concertId: uuidv4(),
        status: ReservationStatus.RESERVED,
      };

      jest
        .spyOn(reservationsService, 'create')
        .mockRejectedValue(
          new BadRequestException('Not enough seats available'),
        );

      await expect(
        controller.reserve(req, createReservationDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('findAll => should return list of reservations', async () => {
    const userId = uuidv4();
    const req: Partial<Request> = { user: { sub: userId, role: Role.USER } };
    const filterReservationDto = {
      page: 1,
      pageSize: 10,
    } as FilterReservationDto;

    const concerts: Concert[] = [...Array(2)].map((_, i) => {
      return {
        id: uuidv4(),
        name: `concert-${i}`,
        description: `enjoy at concert-${i}`,
        seat: 100,
        availableSeats: 90,
        createdBy: { id: uuidv4, role: Role.ADMIN } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Concert;
    });

    const reservations: Reservation[] = [...Array(2)].map((_, i) => {
      return {
        id: uuidv4(),
        user: { id: userId } as User,
        concert: concerts[i],
        status: ReservationStatus.RESERVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Reservation;
    });

    const response: Pagination<Reservation> = {
      data: reservations,
      metadata: {
        itemCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 2,
      },
    };

    jest.spyOn(reservationsService, 'findAll').mockResolvedValue(response);

    const result = await controller.findAll(req, filterReservationDto);

    expect(reservationsService.findAll).toHaveBeenCalledWith(
      userId,
      Role.USER,
      filterReservationDto,
    );
    expect(result).toEqual(response);
  });
});
