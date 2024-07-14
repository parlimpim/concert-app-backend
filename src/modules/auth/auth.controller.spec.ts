import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Role } from 'src/enums/role.enum';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { SwitchRoleDto } from './dto/switch-role.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser = {
    id: uuidv4(),
    name: 'user 01',
    email: 'user01@gmail.com',
    role: Role.USER,
  } as User;

  const authService = {
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    switchRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login => should return login successful response', async () => {
    const isAdmin = false;
    const req: Partial<Request> = {
      user: {
        user: {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        isAdmin,
      },
    };

    const response = {
      user: { ...mockUser, loginRole: Role.USER },
      tokens: { accessToken: 'access_token', refreshToken: 'refresh_token' },
    };

    jest.spyOn(authService, 'login').mockReturnValue(response);

    const result = await controller.login(req);

    expect(authService.login).toHaveBeenCalledWith(req.user['user'], isAdmin);
    expect(result).toEqual({ message: 'Login successful', ...response });
  });

  it('logout => should return logout successful response', async () => {
    const req: Partial<Request> = {
      user: { sub: mockUser.id },
    };
    jest.spyOn(authService, 'logout').mockReturnValue(null);

    const result = await controller.logout(req);

    expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual({ message: 'Logout successful' });
  });

  describe('refreshToken', () => {
    it('should return refresh token successful', async () => {
      const refreshToken = 'refresh token';
      const req: Partial<Request> = {
        user: { sub: mockUser.id, refreshToken },
      };
      const response = {
        tokens: { accessToken: 'new access token' },
      };

      jest.spyOn(authService, 'refresh').mockReturnValue(response);

      const result = await controller.refreshToken(req);

      expect(authService.refresh).toHaveBeenCalledWith(
        mockUser.id,
        refreshToken,
      );
      expect(result).toEqual({
        message: 'Refresh token successful',
        ...response,
      });
    });

    it('should return Forbidden error if refresh token is not matched', async () => {
      const req: Partial<Request> = {
        user: { sub: mockUser.id, refreshToken: 'unmatched refresh token' },
      };

      jest
        .spyOn(authService, 'refresh')
        .mockRejectedValue(new ForbiddenException('Access Denied'));

      await expect(controller.refreshToken(req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('switchRole', () => {
    it('should return switch role successful response', async () => {
      // switch to user role
      const currentRole = Role.ADMIN;
      const newRole = Role.USER;
      const switchRoleDto: SwitchRoleDto = { role: newRole };

      const user = {
        id: uuidv4(),
        name: 'admin 01',
        email: 'admin01@gmail.com',
        role: Role.ADMIN,
      } as User;

      const req: Partial<Request> = {
        user: { sub: user.id, name: user.name, role: currentRole },
      };

      const response = {
        user: { ...user, loginRole: newRole },
        tokens: {
          accessToken: 'new access token',
          refreshToken: 'new refresh token',
        },
      };

      jest.spyOn(authService, 'switchRole').mockResolvedValue(response);

      const result = await controller.switchRole(req, switchRoleDto);

      expect(authService.switchRole).toHaveBeenCalledWith(
        user.id,
        currentRole,
        newRole,
      );
      expect(result).toEqual({
        message: 'Switch role successful',
        ...response,
      });
    });

    it('should return Forbidden error if user try to switch role without permission', async () => {
      // switch to admin role
      const currentRole = Role.USER;
      const newRole = Role.ADMIN;
      const switchRoleDto: SwitchRoleDto = { role: newRole };

      const req: Partial<Request> = {
        user: { sub: mockUser.id, role: currentRole },
      };

      jest
        .spyOn(authService, 'switchRole')
        .mockRejectedValue(
          new ForbiddenException('Only admins can switch roles'),
        );

      await expect(controller.switchRole(req, switchRoleDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return BadRequest error if user try to switch to the same role', async () => {
      // switch to the same role
      const currentRole = Role.ADMIN;
      const newRole = Role.ADMIN;
      const switchRoleDto: SwitchRoleDto = { role: newRole };

      const user = {
        id: uuidv4(),
        name: 'admin 01',
        email: 'admin01@gmail.com',
        role: Role.ADMIN,
      } as User;

      const req: Partial<Request> = {
        user: { sub: user.id, name: user.name, role: currentRole },
      };

      jest
        .spyOn(authService, 'switchRole')
        .mockRejectedValue(
          new BadRequestException('You already have this role'),
        );

      await expect(controller.switchRole(req, switchRoleDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
