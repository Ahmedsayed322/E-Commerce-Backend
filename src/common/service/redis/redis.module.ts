import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
@Global()
@Module({
  imports: [],
  exports: ['REDIS_CLIENT'],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const redis = createClient({
          url: process.env.UPSTASH_REDIS_URL!,
        });

        await redis.connect();
        console.log('redis connected');

        redis.on('error', (e) => {
          console.log('failed to connect redis', e);
        });
        return redis;
      },
    },
  ],
})
export class redisModule {}
