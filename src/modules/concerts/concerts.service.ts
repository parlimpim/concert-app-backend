import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Concert } from './entities/concert.entity';
import { Repository } from 'typeorm';
import { CreateConcertDto } from './dto/create-concert.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert) private concertRepository: Repository<Concert>,
  ) {}

  async create(userId: string, createConcertDto: CreateConcertDto) {
    try {
      const concert: Concert = new Concert();
      concert.name = createConcertDto.name;
      concert.description = createConcertDto.desciption;
      concert.total_seats = createConcertDto.total_seats;
      concert.created_by = { id: userId } as User;
      return await this.concertRepository.save(concert);
    } catch (err) {
      throw new BadRequestException(
        'Concert name already in use. Please choose another name.',
      );
    }
  }
}
