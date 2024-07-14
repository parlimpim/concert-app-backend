import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'src/enums/role.enum';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  const userService = {
    register: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register', async () => {
    const createUserDto: CreateUserDto = {
      name: 'user 01',
      email: 'user01@gmail.com',
      password: 'password',
      role: Role.USER,
    };

    const userWithOutPassowrd = new User();
    userWithOutPassowrd.id = uuidv4();
    userWithOutPassowrd.name = 'user 01';
    userWithOutPassowrd.email = 'user01@gmail.com';
    userWithOutPassowrd.role = Role.USER;
    userWithOutPassowrd.createdAt = new Date();
    userWithOutPassowrd.updatedAt = new Date();

    jest.spyOn(userService, 'register').mockReturnValue(userWithOutPassowrd);

    // call register
    const result = await controller.register(createUserDto);

    // should return new user
    expect(userService.register).toHaveBeenCalledWith(createUserDto);
    expect(result).toEqual(userWithOutPassowrd);
  });
});
