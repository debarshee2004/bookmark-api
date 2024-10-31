import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaOrmService } from 'src/prisma-orm/prisma-orm.service';
import { SignInAuthDto, SignUpAuthDto } from './dto';

import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaOrmService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignUpAuthDto) {
    if (!dto.email || !dto.password || !dto.firstName || !dto.lastName) {
      throw new ForbiddenException('All fields are required.');
    }

    const hashed_password = await argon.hash(dto.password);

    try {
      const savedUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hashed_password,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      return this.signToken(savedUser.id, savedUser.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists. Please Login.');
        }
      }
      throw error;
    }
  }

  async signin(dto: SignInAuthDto) {
    if (!dto.email || !dto.password) {
      throw new ForbiddenException('All fields are required.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found. Create an account.');
    }

    const passwordMatch = await argon.verify(user.hash, dto.password);

    if (!passwordMatch) {
      throw new ForbiddenException('Invalid password.');
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
