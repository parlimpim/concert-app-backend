import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ReservationsService } from './reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Role } from 'src/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { ReservationStatus } from 'src/enums/reservation-status.enum';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Concert } from '../concerts/entities/concert.entity';
import { DataSource, QueryRunner } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { Pagination } from 'src/utils/pagination';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const reservationRepository = {
    createQueryBuilder: jest.fn(),
  };

  let dataSource: DataSource;
  const dataSourceValue = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    }),
  };

  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationRepository,
        },
        {
          provide: DataSource,
          useValue: dataSourceValue,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    dataSource = module.get<DataSource>(DataSource);

    queryRunner = dataSource.createQueryRunner();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new reservation', async () => {
      const availableSeats = 100;

      // reserve a concert
      const concert = {
        id: uuidv4(),
        name: 'concert A',
        availableSeats,
      } as Concert;
      const createReservationDto: CreateReservationDto = {
        concertId: concert.id,
        status: ReservationStatus.RESERVED,
      };

      const user = {
        id: uuidv4(),
        name: 'user 01',
        email: 'user01@gmail.com',
        role: Role.USER,
      } as User;

      const lastReservation: Reservation = {
        id: uuidv4(),
        user: user,
        concert: concert,
        status: ReservationStatus.CANCELED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // first value for lastReservation and second value for concert
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(lastReservation)
        .mockResolvedValueOnce(concert);

      await service.create(user.id, createReservationDto);

      // should save with the concert with reserved status
      expect(queryRunner.manager.save).toHaveBeenCalledWith({
        concert: concert,
        user: { id: user.id },
        status: createReservationDto.status,
      });

      expect(concert.availableSeats).toEqual(availableSeats - 1);

      // if this transaction is success, commitTransaction func should be called
      expect(queryRunner.commitTransaction).toHaveBeenCalled();

      // finally call release func
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user try to cancel the unreserved concert', async () => {
      const user = {
        id: uuidv4(),
        name: 'user 01',
        email: 'user01@gmail.com',
        role: Role.USER,
      } as User;

      // cancel a concert
      const concert = {
        id: uuidv4(),
        name: 'concert A',
        availableSeats: 100,
      } as Concert;
      const createReservationDto: CreateReservationDto = {
        concertId: concert.id,
        status: ReservationStatus.CANCELED,
      };

      // not found the reservation
      jest.spyOn(queryRunner.manager, 'findOne').mockReturnValue(null);

      // should throw NotFoundException
      await expect(
        service.create(user.id, createReservationDto),
      ).rejects.toThrow(NotFoundException);

      // this transaction is not success then rollback
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();

      // finally call release func
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user try to reserve a sold out concert', async () => {
      const user = {
        id: uuidv4(),
        name: 'user 01',
        email: 'user01@gmail.com',
        role: Role.USER,
      } as User;

      // reserve a concert
      const soldOutConcert = {
        id: uuidv4(),
        name: 'concert A',
        availableSeats: 0,
      } as Concert;
      const createReservationDto: CreateReservationDto = {
        concertId: soldOutConcert.id,
        status: ReservationStatus.RESERVED,
      };

      // first value for lastReservation and second value for concert
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(soldOutConcert);

      await expect(
        service.create(user.id, createReservationDto),
      ).rejects.toThrow(BadRequestException);

      // if this transaction is success, commitTransaction func should be called
      expect(queryRunner.commitTransaction).toHaveBeenCalled();

      // finally call release func
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return list of reservations by user id', async () => {
      const user = {
        id: uuidv4(),
        name: 'user 01',
        email: 'user01@gmail.com',
        role: Role.USER,
      } as User;

      const numberOfReservations = 2;

      const concerts: Concert[] = [...Array(numberOfReservations)].map(
        (_, i) => {
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
        },
      );

      const reservations: Reservation[] = [...Array(numberOfReservations)].map(
        (_, i) => {
          return {
            id: uuidv4(),
            user,
            concert: concerts[i],
            status: ReservationStatus.RESERVED,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Reservation;
        },
      );

      const filterReservationDto = {
        page: 1,
        pageSize: 10,
      } as FilterReservationDto;

      const andWhere = jest.fn().mockReturnThis();
      jest.spyOn(reservationRepository, 'createQueryBuilder').mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere,
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([reservations, numberOfReservations]),
      });

      const result = await service.findAll(
        user.id,
        Role.USER,
        filterReservationDto,
      );

      // expect to where condition with user id
      expect(andWhere).toHaveBeenCalledWith('user.id = :userId', {
        userId: user.id,
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

      expect(result).toEqual(response);
    });
  });
});
