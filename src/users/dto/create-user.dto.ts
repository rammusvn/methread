import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty() // can't be empty
  @IsString() // must be a string
  username: string;
  @ApiProperty()
  @IsEmail() // must be an email
  email: string;
  @ApiProperty()
  @IsOptional()
  @IsString() // must be a string
  @MinLength(6) // require min length = 6
  password?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
