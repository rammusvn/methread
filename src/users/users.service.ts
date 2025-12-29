import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find({
      take: 20,
      select: ['id', 'email', 'username', 'role', 'created_at', 'bio', 'image'],
    });
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    const { password, ...returnUser } = user;
    return returnUser;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }

  async create(user: CreateUserDto): Promise<User> {
    const existUser = await this.userRepository.findOneBy({
      email: user.email,
    });
    if (existUser !== null) {
      throw new HttpException('email already exist', HttpStatus.CONFLICT);
    }
    const newUser = this.userRepository.create({ ...user });
    return await this.userRepository.save(newUser);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (user === null) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    const { password, ...returnUser } = await this.userRepository.remove(user);
    return returnUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException('user not existed', HttpStatus.NOT_FOUND);
    }
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }
}
