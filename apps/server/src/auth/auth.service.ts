import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
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
    const user = await this.usersService.findOneByEmail(registerDto.email);
    if (user) {
      throw new HttpException('account existed', HttpStatus.CONFLICT);
    }
    const hashedPassword = await this.hashPassword(registerDto.password!);
    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    const { password, ...returnUser } = newUser;
    return returnUser;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    const hashedPassword = user?.password || '$2b$10$fakehashsecret...';
    const isPasswordValid = await this.comparePassword(
      password,
      hashedPassword,
    );
    if (!user || !isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const { password: _, ...result } = user;
    return result;
  }

  login(user: User) {
    const payload = {
      username: user.username,
      id: user.id,
      email: user.email,
      role: user.role,
      image: user.image,
    };
    return {
      access_token: this.jwtServicce.sign(payload),
    };
  }
}
