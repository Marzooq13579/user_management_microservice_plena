import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BlockService } from '../block/block.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import {
  invalidateAllSearchCaches,
  invalidateParticularUserCache,
} from 'src/utils/invalidateUserCache';

@Injectable()
export class UserService implements OnModuleInit {
  private redisClient;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private blockService: BlockService,
    private redisService: RedisService,
  ) {}

  onModuleInit() {
    this.redisClient = this.redisService.getClient();
  }

  async create(createUserDto: CreateUserDto) {
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();
    await invalidateAllSearchCaches(this.redisClient);
    return createdUser;
  }

  async findAllUsers() {
    return this.userModel.find().exec();
  }

  async findOneUser(id: string) {
    const user = await this.redisClient.get(`user:${id}`);
    if (user) {
      return JSON.parse(user);
    }

    const foundUser = await this.userModel.findById(id).exec();
    if (!foundUser) {
      throw new NotFoundException(`user_id_${id}_not_found`);
    }

    await this.redisClient.set(
      `user:${id}`,
      JSON.stringify(foundUser),
      'EX',
      43200,
    ); // cache for 12 hours
    return foundUser;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`user_id_${id}_not_found`);
    }

    await this.redisClient.set(`user:${id}`, JSON.stringify(updatedUser));
    await invalidateAllSearchCaches(this.redisClient);
    return updatedUser;
  }

  async removeUser(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`user_id_${id}_not_found`);
    }

    await this.redisClient.del(`user:${id}`);
    await invalidateAllSearchCaches(this.redisClient);
    await invalidateParticularUserCache(this.redisClient, id);
  }

  async search(
    userId: string,
    username?: string,
    minAge?: number,
    maxAge?: number,
  ) {
    const cacheKey = `search:${userId}:${username || ''}:${minAge || ''}:${maxAge || ''}`;

    const cachedResults = await this.redisClient.get(cacheKey);
    if (cachedResults) {
      return JSON.parse(cachedResults);
    }

    const blockedUserIds = await this.blockService.getBlockedUserIds(userId);

    const query: any = { _id: { $nin: blockedUserIds } };

    if (username) query.username = new RegExp(username, 'i');

    const birthdateQuery: any = {};

    if (minAge) {
      birthdateQuery.$lte = moment().subtract(minAge, 'years').toDate();
    }

    if (maxAge) {
      birthdateQuery.$gte = moment().subtract(maxAge, 'years').toDate();
    }

    if (Object.keys(birthdateQuery).length > 0) {
      query.birthdate = birthdateQuery;
    }

    const users = await this.userModel.find(query).exec();

    await this.redisClient.set(cacheKey, JSON.stringify(users), 'EX', 3600); // Cache for 1 hour

    return users;
  }
}
