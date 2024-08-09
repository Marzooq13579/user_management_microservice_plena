import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { BlockModule } from './modules/block/block.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtMiddleware } from './middlewares/jwt.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './modules/redis/redis.service';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27019/userManagementService',
      }),
      inject: [ConfigService],
    }),
    UserModule,
    BlockModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'users/search', method: RequestMethod.GET },
        { path: 'block/:blockedUserId', method: RequestMethod.ALL },
      );
  }
}
