import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guards';
import { EditUserDto } from './dto';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  deleteUser(userId: number) {
    return this.userService.deleteUser(userId);
  }
}
