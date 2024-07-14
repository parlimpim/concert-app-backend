import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Role } from 'src/enums/role.enum';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { User } from '../users/entities/user.entity';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: uuidv4(),
    name: 'user 01',
    email: 'user01@gmail.com',
    password: 'hashedpassword',
    role: Role.USER,
  } as User;

  const usersService = {
    findOne: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const configService = {
    get: jest.fn(),
  };

  const refreshTokensService = {
    update: jest.fn(),
    findOneByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: RefreshTokensService,
          useValue: refreshTokensService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      jest.spyOn(usersService, 'findOne').mockReturnValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      const result = await service.validateUser(
        mockUser.email,
        mockUser.password,
      );

      const { password: _, ...userWithOutPassword } = mockUser;
      expect(result).toEqual(userWithOutPassword);
    });

    it('should return null if not found email', async () => {
      jest.spyOn(usersService, 'findOne').mockReturnValue(null);

      const result = await service.validateUser(
        'invaliduser@example.com',
        'password',
      );
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      jest.spyOn(usersService, 'findOne').mockReturnValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      const result = await service.validateUser(
        mockUser.email,
        mockUser.password,
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return user info and tokens', async () => {
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };

      jest
        .spyOn(jwtService, 'signAsync')
        .mockReturnValueOnce('access')
        .mockReturnValueOnce('refresh');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashesrefreshtoken');
      jest.spyOn(refreshTokensService, 'update').mockReturnValue(undefined);

      // user role login as normal user
      const result = await service.login(mockUser, false);

      const { password: _, ...user } = mockUser;
      expect(result).toEqual({
        user: { ...user, loginRole: Role.USER },
        tokens,
      });
    });

    it('should throw ForbiddenException if user tries to login as admin without permission', async () => {
      // user role login as admin user
      await expect(service.login(mockUser, true)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('logout', () => {
    it('should call refreshTokensService to update with null', async () => {
      jest.spyOn(refreshTokensService, 'update').mockReturnValue(undefined);

      const result = await service.logout(mockUser.id);

      expect(refreshTokensService.update).toHaveBeenCalledWith(
        mockUser.id,
        null,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('should return new access tokens', async () => {
      const token = 'refresh token';
      const refreshToken = { token: 'hashed refresh token', user: mockUser };
      const newAccessToken = 'new access token';

      jest
        .spyOn(refreshTokensService, 'findOneByUserId')
        .mockReturnValue(refreshToken);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      jest.spyOn(jwtService, 'signAsync').mockReturnValue(newAccessToken);

      const result = await service.refresh(mockUser.id, token);

      expect(refreshTokensService.findOneByUserId).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual({
        tokens: {
          accessToken: newAccessToken,
        },
      });
    });

    it('invalid case: should throw ForbiddenException if refresh token does not match', async () => {
      const token = 'refresh token';
      const refreshToken = { token: 'hashed refresh token 2', user: mockUser };

      jest
        .spyOn(refreshTokensService, 'findOneByUserId')
        .mockReturnValue(refreshToken);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      await expect(service.refresh(mockUser.id, token)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('switchRole', () => {
    it('valid case: should return user info and tokens of new role', async () => {
      // switch from admin role to user role
      const currentRole = Role.ADMIN;
      const newRole = Role.USER;
      const user = {
        id: uuidv4(),
        name: 'admin01',
        email: 'admin01@gmail.com',
        role: Role.ADMIN,
      } as User;
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockReturnValueOnce('access')
        .mockReturnValueOnce('refresh');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashesrefreshtoken');
      jest.spyOn(refreshTokensService, 'update').mockReturnValue(undefined);

      const result = await service.switchRole(user.id, currentRole, newRole);

      expect(result).toEqual({ user: { ...user, loginRole: newRole }, tokens });
    });

    it('invalid case: should throw ForbiddenException if user try to switch role without permission', async () => {
      const currentRole = Role.USER;
      const newRole = Role.ADMIN;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      await expect(
        service.switchRole(mockUser.id, currentRole, newRole),
      ).rejects.toThrow(ForbiddenException);
    });

    it('invalid case: should throw BadRequestException if user try to switch to the same role', async () => {
      const currentRole = Role.ADMIN;
      const newRole = Role.ADMIN;
      const user = { id: uuidv4(), name: 'admin01', role: Role.ADMIN } as User;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      await expect(
        service.switchRole(user.id, currentRole, newRole),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
