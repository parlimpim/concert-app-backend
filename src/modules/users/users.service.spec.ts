import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'src/enums/role.enum';
import { FindOptionsWhere } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    name: 'user 01',
    email: 'user01@gmail.com',
    password: 'password',
    role: Role.USER,
  };

  const userRepository = {
    findOne: jest.fn(),
  };

  const refreshTokensService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: RefreshTokensService,
          useValue: refreshTokensService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('register user', async () => {
    const createUserDto: CreateUserDto = {
      name: mockUser.name,
      email: mockUser.email,
      password: mockUser.password,
      role: mockUser.role,
    };

    const hashPassword = await bcrypt.hash(mockUser.password, 10);

    const user = new User();
    user.id = uuidv4();
    user.name = mockUser.name;
    user.email = mockUser.email;
    user.password = hashPassword;
    user.role = mockUser.role;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    jest.spyOn(refreshTokensService, 'create').mockResolvedValue({
      id: uuidv4(),
      user: user,
      tokens: {},
    });

    // create
    const result = await service.register(createUserDto);

    // expect save func to called with create todo dto
    expect(refreshTokensService.create).toHaveBeenCalledWith(
      createUserDto as User,
    );

    // expect result
    // remove password
    const { password: _, ...response } = user;
    expect(result).toEqual(response);
  });

  it('findOne', async () => {
    const where: FindOptionsWhere<User> = {
      email: mockUser.email,
    };

    const user = new User();
    user.id = uuidv4();
    user.email = mockUser.email;

    jest.spyOn(userRepository, 'findOne').mockReturnValue(user);

    // findOne
    const result = await service.findOne(where);

    // expect findOne to be called
    expect(userRepository.findOne).toHaveBeenCalledWith({ where });

    // expect result
    expect(result).toBe(user);
  });
});
