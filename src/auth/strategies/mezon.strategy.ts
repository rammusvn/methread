import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import axios from 'axios';
import { Strategy } from 'passport-oauth2';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class MezonStrategy extends PassportStrategy(Strategy, 'mezon') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      authorizationURL: configService.get<string>('MEZON_AUTH_URL')!,
      tokenURL: configService.get<string>('MEZON_TOKEN_URL')!,
      clientID: configService.get<string>('MEZON_CLIENT_ID')!,
      clientSecret: configService.get<string>('MEZON_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('MEZON_CALLBACK_URL')!,
      scope: ['openid', 'offline'],
      state: true,
    });
  }
  async validate(accessToken: string, refreshToken: string): Promise<any> {
    const userInfo = await axios.get(
      this.configService.get<string>('MEZON_USER_URL')!,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const userEmail = userInfo.data.email as string;
    const user = await this.userService.findOneByEmail(userEmail);

    if (user === null) {
      const newUser: CreateUserDto = {
        email: userInfo.data.email as string,
        username: userInfo.data.username as string,
        image: userInfo.data.avatar as string,
      };
      const createdUser = await this.userService.create(newUser);
      return createdUser;
    } else {
      return user;
    }
  }
}
