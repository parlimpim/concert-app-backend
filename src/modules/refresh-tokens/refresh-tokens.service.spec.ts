import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

describe('RefreshTokensService', () => {
  let service: RefreshTokensService;

  const user = { id: uuidv4(), name: 'user01' } as User;

  const refreshTokenRepository = {
    save: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokensService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
        },
      ],
    }).compile();

    service = module.get<RefreshTokensService>(RefreshTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create => create refresh token and cascafe insert user', async () => {
    const refreshToken: RefreshToken = {
      id: uuidv4(),
      user,
      token: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(refreshTokenRepository, 'save').mockReturnValue(refreshToken);

    // call create func
    const result = await service.create(user);

    expect(refreshTokenRepository.save).toHaveBeenCalledWith({ user });
    expect(result).toEqual(refreshToken);
  });

  it('update', async () => {
    const token = 'refresh token';
    const refreshToken: RefreshToken = {
      id: uuidv4(),
      user,
      token,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(refreshTokenRepository, 'update').mockReturnValue(refreshToken);

    // call update func
    const result = await service.update(user.id, token);

    expect(refreshTokenRepository.update).toHaveBeenCalledWith(
      { user: { id: user.id } },
      { token },
    );
    expect(result).toEqual(refreshToken);
  });

  it('findOneByUserId => find refresh token by a given user id', async () => {
    const refreshToken: RefreshToken = {
      id: uuidv4(),
      user,
      token: 'refresh token',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(refreshTokenRepository, 'findOne').mockReturnValue(refreshToken);

    const result = await service.findOneByUserId(user.id);

    expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
      where: { user: { id: user.id } },
      relations: { user: true },
    });
    expect(result).toEqual(refreshToken);
  });
});
