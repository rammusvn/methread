import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { GetUserDto } from './dto/get-user.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CurrentUser } from 'src/common/decorators/user.decoratos';

@Controller('users')
@UseInterceptors(CacheInterceptor)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiResponse({
    status: 200,
    type: [GetUserDto],
  })
  @ApiOperation({ summary: 'Retrieve all users' })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  findInfo(@CurrentUser() currentUser) {
    return currentUser;
  }

  @Get('/:id')
  @ApiResponse({
    status: 200,
    type: GetUserDto,
  })
  @ApiOperation({ summary: 'Get user details by ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: GetUserDto,
  })
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.usersService.create(createUserDto);
    // eslint-disable-next-line
    const { password, ...result } = createdUser;
    return result;
  }
  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: GetUserDto,
  })
  @ApiOperation({ summary: 'Update user information by ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
  @ApiResponse({
    status: 200,
    type: GetUserDto,
  })
  @ApiOperation({ summary: 'Delete user by ID' })
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.remove(id);
    return user;
  }
}
