import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { LandingService } from '../landing/landing.service';
import { RedisService } from '../redis/redis.service';
import { SocketGateway } from '../socket/socket.gateway';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaService: {
    fitapi_machine: { count: jest.Mock };
    fitapi_payment: { aggregate: jest.Mock };
  };
  let landingService: { getHeroData: jest.Mock };
  let redisService: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    prismaService = {
      fitapi_machine: { count: jest.fn().mockResolvedValue(3) },
      fitapi_payment: { aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 100 } }) },
    };
    landingService = {
      getHeroData: jest.fn().mockResolvedValue({ coaches: 1, members: 2, plans: 3 }),
    };
    redisService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prismaService },
        { provide: LandingService, useValue: landingService },
        { provide: RedisService, useValue: redisService },
        { provide: SocketGateway, useValue: { server: { emit: jest.fn() } } },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should return cached dashboard stats from Redis when available', async () => {
    const cachedStats = {
      coaches: 7,
      members: 8,
      plans: 9,
      machines: 10,
      monthlyRevenue: 55,
    };

    redisService.get.mockResolvedValue(JSON.stringify(cachedStats));

    await expect(service.getStats()).resolves.toEqual(cachedStats);
    expect(landingService.getHeroData).not.toHaveBeenCalled();
    expect(prismaService.fitapi_machine.count).not.toHaveBeenCalled();
    expect(redisService.get).toHaveBeenCalledWith('dashboard:stats');
  });
});
