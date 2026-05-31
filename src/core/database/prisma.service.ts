import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaClient } from '@prisma/client';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    /**
     * PostgreSQL native connection pool
     */
    const pool = new Pool({
      connectionString: configService.get<string>('DATABASE_URL'),
    });

    /**
     * Prisma PostgreSQL adapter
     */
    const adapter = new PrismaPg(pool);

    super({
      adapter,

      log:
        configService.get<string>('NODE_ENV') === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    this.logger.log('Database connected successfully');
  }

  enableShutdownHooks(app: INestApplication) {
    const shutdown = async (signal: NodeJS.Signals) => {
      this.logger.warn(`Received ${signal}. Closing Prisma connection...`);
      await this.$disconnect();
      await app.close();
    };

    process.once('SIGTERM', () => void shutdown('SIGTERM'));
    process.once('SIGINT', () => void shutdown('SIGINT'));
  }
}
