import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private refreshTokensService: RefreshTokensService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const user: User = new User();
      user.name = createUserDto.name;
      user.email = createUserDto.email;
      user.password = createUserDto.password;
      user.role = createUserDto.role;

      const { user: newUser } = await this.refreshTokensService.create(user);
      const { password: _, ...response } = newUser;
      return response;
    } catch (error) {
      throw new BadRequestException('Email address already in use');
    }
  }

  async findOne(data: any) {
    return await this.userRepository.findOne({ where: data });
  }
}
