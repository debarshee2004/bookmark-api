import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { EditUserDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  getMe(user: any) {
    return user;
  }

  @Patch('update')
  editUser(userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  @Delete('delete')
  deleteUser(userId: number) {
    return this.userService.deleteUser(userId);
  }
}
