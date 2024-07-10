import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class SwitchRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  @ApiProperty({ example: Role.USER })
  role: Role;
}
