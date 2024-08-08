import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BlockService } from '../block/block.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private redisClient: Redis;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private blockService: BlockService,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async create(createUserDto: CreateUserDto) {
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();
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

    await this.redisClient.set(`user:${id}`, JSON.stringify(foundUser));
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
    return updatedUser;
  }

  async removeUser(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`user_id_${id}_not_found`);
    }

    await this.redisClient.del(`user:${id}`);
  }

  async search(
    userId: string,
    username?: string,
    minAge?: number,
    maxAge?: number,
  ) {
    const blockedUserIds = await this.blockService.getBlockedUserIds(userId);

    const query: any = { _id: { $nin: blockedUserIds } };

    if (username) query.username = new RegExp(username, 'i');

    const birthdateQuery: any = {};

    if (minAge) {
      console.log('years', moment().subtract(minAge, 'years').toDate());
      birthdateQuery.$lte = moment().subtract(minAge, 'years').toDate();
    }

    if (maxAge) {
      birthdateQuery.$gte = moment().subtract(maxAge, 'years').toDate();
    }

    if (Object.keys(birthdateQuery).length > 0) {
      query.birthdate = birthdateQuery;
    }

    const users = await this.userModel.find(query).exec();
    return users;
  }
}
