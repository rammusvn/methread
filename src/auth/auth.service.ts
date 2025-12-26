import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtServicce: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await this.hashPassword(registerDto.password!);
    return this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new HttpException('account not existed', HttpStatus.NOT_FOUND);
    }
    const isPasswordValid = await this.comparePassword(
      password,
      user?.password || '',
    );

    if (user && isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    if (user?.password !== password) {
      throw new HttpException('Password incorrect', HttpStatus.UNAUTHORIZED);
    }

    return null;
  }

  login(user: User) {
    const payload = {
      username: user.username,
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtServicce.sign(payload),
    };
  }
}
