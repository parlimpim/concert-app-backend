import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConcertsService } from './concerts.service';
import { AccessTokenAuthGuard } from '../auth/guards/access-token.guard';
import { CreateConcertDto } from './dto/create-concert.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { FilterConcertDto } from './dto/filter-concert.dto';

@ApiTags('concerts')
@UseGuards(AccessTokenAuthGuard, RolesGuard)
@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  // TODO: handle restricted route response
  @Roles(Role.ADMIN)
  @Post()
  @ApiResponse({ status: 201, description: 'Create concert successful' })
  @ApiResponse({
    status: 400,
    description: 'Concert name already in use. Please choose another name.',
  })
  async create(@Request() req, @Body() createConcertDto: CreateConcertDto) {
    const userId = req.user['sub'];
    const concert = await this.concertsService.create(userId, createConcertDto);
    return { message: 'Create concert successful', concert };
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'description', required: false, type: String })
  @ApiQuery({ name: 'seat', required: false, type: Number })
  @ApiResponse({ status: 201, description: 'List concerts successful' })
  async findAll(@Query() filterConcertDto: FilterConcertDto) {
    return await this.concertsService.findAll(filterConcertDto);
  }
}
