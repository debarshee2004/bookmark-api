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
  }

  async deleteUser(userId: number) {
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return {
      statusCode: 201,
      message: 'User deleted successfully',
    };
  }
}
