import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { MezonAuthGuard } from './guards/mezon-auth.guard';
import { ApiBody, ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Authenticate user and return access token' })
  @ApiBody({ type: LoginCredentialsDto })
  @UseGuards(LocalAuthGuard)
  login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const { access_token } = this.authService.login(req.user);
    response.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });
    return { message: 'Login successful' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logout successful' };
  }

  @Get('mezon')
  @ApiExcludeEndpoint()
  @UseGuards(MezonAuthGuard)
  loginWithMezon() {}

  @Get('mezon/callback')
  @ApiExcludeEndpoint()
  @UseGuards(MezonAuthGuard)
  mezonCallBack(@Req() req, @Res() response: Response) {
    const { access_token } = this.authService.login(req.user);
    response.cookie('access_token', access_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 24 hours
    });
    return response.redirect(this.configService.get<string>('CLIENT_URL')!);
  }
}
