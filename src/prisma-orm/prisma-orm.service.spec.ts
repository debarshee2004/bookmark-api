import { Test, TestingModule } from '@nestjs/testing';
import { PrismaOrmService } from './prisma-orm.service';

describe('PrismaOrmService', () => {
  let service: PrismaOrmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaOrmService],
    }).compile();

    service = module.get<PrismaOrmService>(PrismaOrmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
