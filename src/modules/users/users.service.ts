import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user: User = new User();
      user.name = createUserDto.name;
      user.email = createUserDto.email;
      user.password = createUserDto.password;
      if (createUserDto.role) {
        user.role = createUserDto.role;
      }
      const { password: _, ...response } = await this.userRepository.save(user);
      return response;
    } catch (error) {
      throw new BadRequestException('Email address already in use');
    }
  }

  async findOne(data: any) {
    return await this.userRepository.findOne({ where: data });
  }
}
