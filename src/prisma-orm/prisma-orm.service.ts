import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaOrmService extends PrismaClient {
  constructor(config: ConfigService) {
    try {
      const databaseUrl = config.get<string>('DATABASE_URL');
      if (!databaseUrl) {
        throw new Error('DATABASE_URL is not defined');
      }
      super({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      });
    } catch (error) {
      console.error('Error initializing PrismaOrmService:', error.message);
      throw error;
    }
  }

  // The cleanDB method deletes all records from the user and bookmark tables within a single transaction using Prisma ORM.
  cleanDB() {
    return this.$transaction([
      this.user.deleteMany(),
      this.bookmark.deleteMany(),
    ]);
  }
}
