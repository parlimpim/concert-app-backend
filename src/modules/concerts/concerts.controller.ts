import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConcertsService } from './concerts.service';
import { AccessTokenAuthGuard } from '../auth/guards/access-token.guard';
import { CreateConcertDto } from './dto/create-concert.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';

@ApiTags('concerts')
@UseGuards(AccessTokenAuthGuard)
@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  // TODO: handle restricted route response
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  async create(@Request() req, @Body() createConcertDto: CreateConcertDto) {
    const userId = req.user['sub'];
    const concert = await this.concertsService.create(userId, createConcertDto);
    return { message: 'Create concert successful', concert };
  }
}
