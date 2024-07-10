import { Module } from '@nestjs/common';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concert } from './entities/concert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Concert])],
  controllers: [ConcertsController],
  providers: [ConcertsService],
})
export class ConcertsModule {}
