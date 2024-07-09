import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true, default: 'user 01' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ required: true, default: 'user01@gmail.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true, default: 'password' })
  password: string;

  @IsEnum(Role)
  @ApiProperty({ required: false })
  role: Role;
}
