import {
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
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AccessTokenAuthGuard } from './guards/access-token.guard';
import { ClearTokensInterceptor } from 'src/interceptors/clear-tokens.interceptor';

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
    const response = await this.authService.login(req.user);
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
}
