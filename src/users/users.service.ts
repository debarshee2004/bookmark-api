import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaOrmService } from 'src/prisma-orm/prisma-orm.service';
import { EditUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaOrmService) {}

  async editUser(userId: number, dto: EditUserDto) {
    if (!dto.email || !dto.firstName || !dto.lastName) {
      throw new ForbiddenException('All fields are required.');
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...dto,
        },
      });

      delete updatedUser.hash;
      return updatedUser;
    } catch (error) {
      throw new ForbiddenException(
        'User update failed. Please try again later.',
      );
    }
  }

  async deleteUser(userId: number) {
    try {
      await this.prisma.user.delete({
        where: {
          id: userId,
        },
      });
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new ForbiddenException(
        'User deletion failed. Please try again later.',
      );
    }
  }
}
