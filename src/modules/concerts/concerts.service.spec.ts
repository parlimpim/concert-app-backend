import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { toPagination } from 'src/utils/pagination';
import { ReservationStatus } from 'src/enums/reservation-status.enum';
import { Role } from 'src/enums/role.enum';
import { ConcertsService } from './concerts.service';
import { Concert } from './entities/concert.entity';
import { CreateConcertDto } from './dto/create-concert.dto';
import { User } from '../users/entities/user.entity';
import { FilterConcertDto } from './dto/filter-concert.dto';

describe('ConcertsService', () => {
  let service: ConcertsService;

  const DEFAULT_PAGE = 1;
  const DEFAULT_PAGE_SIZE = 10;

  const concertRepository = {
    save: jest.fn(),
    count: jest.fn(),
    query: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        {
          provide: getRepositoryToken(Concert),
          useValue: concertRepository,
        },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create', async () => {
    const createConcertDto: CreateConcertDto = {
      name: 'concert 1',
      description: 'enjoy concert 1',
      seat: 100,
    };

    const user = { id: uuidv4() } as User;

    const createConcert = {
      ...createConcertDto,
      availableSeats: 100,
      createdBy: user,
    } as Concert;

    const concert: Concert = {
      id: uuidv4(),
      name: 'concert 1',
      description: 'enjoy concert 1',
      seat: 100,
      availableSeats: 100,
      createdBy: user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(concertRepository, 'save').mockResolvedValue(concert);

    // create
    const result = await service.create(user.id, createConcertDto);

    expect(concertRepository.save).toHaveBeenCalledWith(createConcert);

    // expect result
    expect(result).toEqual(concert);
  });

  it('findAll without filter', async () => {
    const user = { id: uuidv4(), name: 'admin 01', role: Role.ADMIN } as User;
    const numberOfConcerts = 5;
    const concerts: Concert[] = [...Array(numberOfConcerts)].map((_, i) => {
      return {
        id: uuidv4(),
        name: `concert-${i}`,
        description: `enjoy at concert-${i}`,
        seat: 100,
        availableSeats: 90,
        createdBy: user,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Concert;
    });

    const filterConcertDto = {
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    } as FilterConcertDto;

    jest.spyOn(concertRepository, 'count').mockReturnValue(numberOfConcerts);
    jest.spyOn(concertRepository, 'query').mockReturnValue(concerts);

    // findAll
    const result = await service.findAll(user.id, filterConcertDto);

    expect(concertRepository.count).toHaveBeenCalled();
    expect(concertRepository.query).toHaveBeenCalled();

    // expect result
    const response = toPagination(
      concerts,
      numberOfConcerts,
      filterConcertDto.page,
      filterConcertDto.pageSize,
    );
    expect(result).toEqual(response);
  });

  it('findAll with filter', async () => {
    const user = { id: uuidv4(), name: 'admin 01', role: Role.ADMIN } as User;
    const numberOfConcerts = 10;
    const concerts: Concert[] = [...Array(numberOfConcerts)].map((_, i) => {
      return {
        id: uuidv4(),
        name: i >= 5 ? `festival-${i}` : `concert-${i}`,
        description: `enjoy at concert-${i}`,
        seat: 100,
        availableSeats: 90,
        createdBy: user,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Concert;
    });
    const filteredConcerts = concerts.filter((concert) =>
      concert.name.startsWith('concert'),
    );

    const page = DEFAULT_PAGE;
    const pageSize = DEFAULT_PAGE_SIZE;
    const filterConcertDto = {
      page,
      pageSize,
      name: 'concert',
    } as FilterConcertDto;

    const query = `
      SELECT c.id, c.name, c.description, c.seat, c.available_seats as "availableSeats", c.created_at as "createdAt", c.updated_at as "updatedAt", CASE
               WHEN r.status = $1 THEN true
               ELSE false
             END AS "isReserved"
      FROM concert c
      LEFT JOIN (
        SELECT DISTINCT ON (concert_id) concert_id, status, "created_at"
        FROM reservation
        WHERE user_id = $2
        ORDER BY concert_id, "created_at" DESC
      ) r ON c.id = r.concert_id
      WHERE 1=1 AND c.name ILIKE $5
      ORDER BY c.id
      LIMIT $3 OFFSET $4`;

    const params = [
      ReservationStatus.RESERVED,
      user.id,
      pageSize,
      (page - 1) * pageSize,
      `%${filterConcertDto.name}%`,
    ];

    jest
      .spyOn(concertRepository, 'count')
      .mockReturnValue(filteredConcerts.length);
    jest.spyOn(concertRepository, 'query').mockReturnValue(filteredConcerts);

    // findAll
    const result = await service.findAll(user.id, filterConcertDto);

    expect(concertRepository.count).toHaveBeenCalled();
    expect(concertRepository.query).toHaveBeenCalledWith(query, params);

    // expect result
    const response = toPagination(
      filteredConcerts,
      filteredConcerts.length,
      page,
      pageSize,
    );
    expect(result).toEqual(response);
  });

  it('findAll with pagination', async () => {
    const user = { id: uuidv4(), name: 'admin 01', role: Role.ADMIN } as User;
    const numberOfConcerts = 5;
    const concerts: Concert[] = [...Array(numberOfConcerts)].map((_, i) => {
      return {
        id: uuidv4(),
        name: `concert-${i}`,
        description: `enjoy at concert-${i}`,
        seat: 100,
        availableSeats: 90,
        createdBy: user,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Concert;
    });

    const page = 2;
    const pageSize = 3;
    const offset = (page - 1) * pageSize;
    const paginatedConcerts = concerts.slice(offset);

    // should have 2 page: 1st page -> 3 items, 2nd page -> 2 items
    const filterConcertDto = {
      page,
      pageSize,
    } as FilterConcertDto;

    const query = `
      SELECT c.id, c.name, c.description, c.seat, c.available_seats as "availableSeats", c.created_at as "createdAt", c.updated_at as "updatedAt", CASE
               WHEN r.status = $1 THEN true
               ELSE false
             END AS "isReserved"
      FROM concert c
      LEFT JOIN (
        SELECT DISTINCT ON (concert_id) concert_id, status, "created_at"
        FROM reservation
        WHERE user_id = $2
        ORDER BY concert_id, "created_at" DESC
      ) r ON c.id = r.concert_id
      WHERE 1=1
      ORDER BY c.id
      LIMIT $3 OFFSET $4`;

    const params = [ReservationStatus.RESERVED, user.id, pageSize, offset];

    // fetch 2nd page
    jest
      .spyOn(concertRepository, 'count')
      .mockReturnValue(paginatedConcerts.length);
    jest.spyOn(concertRepository, 'query').mockReturnValue(paginatedConcerts);

    // findAll
    const result = await service.findAll(user.id, filterConcertDto);

    expect(concertRepository.count).toHaveBeenCalled();
    expect(concertRepository.query).toHaveBeenCalledWith(query, params);

    // expect result
    const response = toPagination(
      paginatedConcerts,
      paginatedConcerts.length,
      page,
      pageSize,
    );
    expect(result).toEqual(response);
  });

  it('delete', async () => {
    const id: string = uuidv4();

    // delete
    const result = await service.remove(id);

    expect(result).toBeUndefined();
    expect(concertRepository.delete).toHaveBeenCalledWith(id);
  });

  it('create: case duplicate concert name', () => {});
});
