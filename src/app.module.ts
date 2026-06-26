import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { redisModule } from './common/service/redis/redis.module';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { S3Service } from './common/service/s3/s3.service';

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
  providers: [AppService, S3Service],
})
export class AppModule {}
