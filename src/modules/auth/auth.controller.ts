import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AccessTokenAuthGuard } from './guards/access-token.guard';
import { ClearTokensInterceptor } from 'src/interceptors/clear-tokens.interceptor';
import { RefreshTokenAuthGuard } from './guards/refresh-token.guard';
import { SwitchRoleDto } from './dto/switch-role.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req) {
    const response = await this.authService.login(
      req.user.user,
      req.user.isAdmin,
    );
    return { message: 'Login successful', ...response };
  }

  @UseGuards(AccessTokenAuthGuard)
  @Get('logout')
  @UseInterceptors(ClearTokensInterceptor)
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req) {
    const userId = req.user['sub'];
    await this.authService.logout(userId);
    return { message: 'Logout successful' };
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Get('refresh')
  @ApiResponse({ status: 200, description: 'Refresh token successful' })
  @ApiResponse({ status: 403, description: 'Access Denied' })
  async refreshToken(@Request() req) {
    const id = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    const response = await this.authService.refresh(id, refreshToken);
    return { message: 'Refresh token successful', ...response };
  }

  @HttpCode(200)
  @UseGuards(AccessTokenAuthGuard)
  @Post('switch-role')
  @ApiBody({ type: SwitchRoleDto })
  @ApiResponse({ status: 200, description: 'Switch role successful' })
  @ApiResponse({
    status: 403,
    description: 'Multiple errors: Access Denied, Only admins can switch roles',
  })
  @ApiResponse({ status: 400, description: 'You already have this role' })
  async switchRole(@Request() req, @Body() switchRoleDto: SwitchRoleDto) {
    const userId = req.user['sub'];
    const role = req.user['role'];
    const response = await this.authService.switchRole(
      userId,
      role,
      switchRoleDto.role,
    );
    return { message: 'Switch role successful', ...response };
  }
}
