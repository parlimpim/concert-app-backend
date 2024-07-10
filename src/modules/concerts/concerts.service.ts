import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Concert } from './entities/concert.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateConcertDto } from './dto/create-concert.dto';
import { User } from '../users/entities/user.entity';
import { FilterConcertDto } from './dto/filter-concert.dto';
import { toPagination } from 'src/utils/pagination';

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert) private concertRepository: Repository<Concert>,
  ) {}

  async create(userId: string, createConcertDto: CreateConcertDto) {
    try {
      const concert: Concert = new Concert();
      concert.name = createConcertDto.name;
      concert.description = createConcertDto.description;
      concert.total_seats = createConcertDto.seat;
      concert.created_by = { id: userId } as User;
      return await this.concertRepository.save(concert);
    } catch (err) {
      throw new BadRequestException(
        'Concert name already in use. Please choose another name.',
      );
    }
  }

  async findAll(filterConcertDto: FilterConcertDto) {
    const { page, pageSize, name, description, seat } = filterConcertDto;

    const where: FindOptionsWhere<Concert> = {};

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    if (description) {
      where.description = ILike(`%${name}%`);
    }

    if (seat) {
      where.total_seats = seat;
    }

    const [concerts, count] = await this.concertRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
    });

    const response = toPagination(concerts, count, page, pageSize);
    return response;
  }
}
