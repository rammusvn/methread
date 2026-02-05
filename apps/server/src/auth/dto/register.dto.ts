import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty() // can't be empty
  @IsString() // must be a string
  username: string;
  @IsEmail() // must be an email
  email: string;
  @IsOptional()
  @IsString() // must be a string
  @MinLength(6) // require min length = 6
  password: string;
}
