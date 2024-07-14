import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Concert } from './entities/concert.entity';
import { Repository } from 'typeorm';
import { CreateConcertDto } from './dto/create-concert.dto';
import { User } from '../users/entities/user.entity';
import { FilterConcertDto } from './dto/filter-concert.dto';
import { toPagination } from 'src/utils/pagination';
import { ReservationStatus } from 'src/enums/reservation-status.enum';

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert) private concertRepository: Repository<Concert>,
  ) {}

  async create(userId: string, createConcertDto: CreateConcertDto) {
    try {
      const concert: Concert = new Concert();
      const { name, description, seat } = createConcertDto;
      concert.name = name;
      concert.description = description;
      concert.seat = seat;
      concert.availableSeats = seat;
      concert.createdBy = { id: userId } as User;
      return await this.concertRepository.save(concert);
    } catch (err) {
      throw new BadRequestException(
        'Concert name already in use. Please choose another name.',
      );
    }
  }

  async findAll(userId: string, filterConcertDto: FilterConcertDto) {
    const { page, pageSize, name, description, seat } = filterConcertDto;
    const offset = (page - 1) * pageSize;
    let query = `
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
      WHERE 1=1`;

    // add where clause
    const params = [ReservationStatus.RESERVED, userId, pageSize, offset];
    let paramIndex = 5;

    if (name) {
      query += ` AND c.name ILIKE $${paramIndex}`;
      params.push(`%${name}%`);
      paramIndex += 1;
    }

    if (description) {
      query += ` AND c.description ILIKE $${paramIndex}`;
      params.push(`%${description}%`);
      paramIndex += 1;
    }

    if (seat) {
      query += ` AND c.seat = $${paramIndex}`;
      params.push(seat);
      paramIndex += 1;
    }

    query += `
      ORDER BY c.id
      LIMIT $3 OFFSET $4`;

    const count = await this.concertRepository.count();
    const concerts = await this.concertRepository.query(query, params);
    const response = toPagination(concerts, count, page, pageSize);
    return response;
  }

  async remove(id: string) {
    await this.concertRepository.delete(id);
  }
}
