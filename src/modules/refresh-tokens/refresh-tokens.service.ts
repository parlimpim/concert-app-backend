import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async create(user: User) {
    const refreshToken: RefreshToken = new RefreshToken();
    refreshToken.user = user;
    return await this.refreshTokenRepository.save(refreshToken);
  }

  async update(userId: string, token: string) {
    return await this.refreshTokenRepository.update(
      { user: { id: userId } },
      { token },
    );
  }

  async findOneByUserId(userId: string) {
    return await this.refreshTokenRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });
  }
}
