import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { DataSource } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Concert } from '../concerts/entities/concert.entity';
import { User } from '../users/entities/user.entity';
import { ReservationStatus } from 'src/enums/reservation-status.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createReservationDto: CreateReservationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { concertId, status } = createReservationDto;

      // check lastest status
      const lastReservation = await queryRunner.manager.findOne(Reservation, {
        where: { user: { id: userId }, concert: { id: concertId } },
        order: { createdAt: 'DESC' },
      });

      if (!lastReservation && status === ReservationStatus.CANCELED) {
        throw new NotFoundException(
          'You do not have an active reservation to cancel.',
        );
      }

      if (lastReservation && lastReservation.status === status) {
        throw new BadRequestException(`You already ${status} this concert.`);
      }

      const concert = await queryRunner.manager.findOne(Concert, {
        where: { id: concertId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!concert) {
        throw new NotFoundException('Concert not found');
      }

      let seat: number;
      if (status === ReservationStatus.RESERVED) {
        if (!concert.availableSeats) {
          throw new BadRequestException('Not enough seats available');
        }
        seat = -1;
      } else {
        seat = 1;
      }

      // Update available seats
      concert.availableSeats += seat;
      await queryRunner.manager.save(concert);

      // create new reservation
      const reservation: Reservation = new Reservation();
      reservation.concert = concert;
      reservation.user = { id: userId } as User;
      reservation.status = status;
      await queryRunner.manager.save(reservation);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
