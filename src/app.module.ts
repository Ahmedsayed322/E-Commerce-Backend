import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { redisModule } from './common/service/redis/redis.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production'],
      isGlobal: true,
    }),
    UserModule,
    redisModule,
    MongooseModule.forRoot(process.env.DB_URI!, {
      onConnectionCreate(con) {
        con.on('connected', () => {
          console.log('database connected');
        });
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
