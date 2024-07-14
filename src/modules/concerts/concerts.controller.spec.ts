import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { toPagination } from 'src/utils/pagination';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { Concert } from './entities/concert.entity';
import { User } from '../users/entities/user.entity';
import { FilterConcertDto } from './dto/filter-concert.dto';

describe('ConcertsController', () => {
  let controller: ConcertsController;

  const user = { id: uuidv4() } as User;
  const req: Partial<Request> = {
    user: { sub: user.id },
  };

  const concertsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertsController],
      providers: [
        {
          provide: ConcertsService,
          useValue: concertsService,
        },
      ],
    }).compile();

    controller = module.get<ConcertsController>(ConcertsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create', async () => {
    const createConcertDto: CreateConcertDto = {
      name: 'concert 1',
      description: 'enjoy concert 1',
      seat: 100,
    };

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

    jest.spyOn(concertsService, 'create').mockReturnValue(concert);

    const result = await controller.create(req, createConcertDto);

    // should return new concert
    expect(concertsService.create).toHaveBeenCalledWith(
      user.id,
      createConcertDto,
    );
    expect(result).toEqual({ message: 'Create concert successful', concert });
  });

  it('findAll', async () => {
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
      page: 1,
      pageSize: 10,
    } as FilterConcertDto;

    const response = toPagination(
      concerts,
      numberOfConcerts,
      filterConcertDto.page,
      filterConcertDto.pageSize,
    );

    jest.spyOn(concertsService, 'findAll').mockReturnValue(response);

    const result = await controller.findAll(req, filterConcertDto);

    // should return an array concert by a filter
    expect(concertsService.findAll).toHaveBeenCalledWith(
      user.id,
      filterConcertDto,
    );
    expect(result).toEqual(response);
  });

  it('remove', async () => {
    const id = uuidv4();
    const result = await controller.remove(id);
    expect(result).toEqual({ message: 'Delete concert successful' });
  });
});
