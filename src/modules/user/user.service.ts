import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private redisClient: Redis;

  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6380,
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

  async search(username?: string, minAge?: number, maxAge?: number) {
    const query: any = {};
    if (username) query.username = new RegExp(username, 'i');
    if (minAge)
      query.birthdate = {
        ...query.birthdate,
        $gte: moment().subtract(minAge, 'years').toDate(),
      };
    if (maxAge)
      query.birthdate = {
        ...query.birthdate,
        $lte: moment().subtract(maxAge, 'years').toDate(),
      };
    const users = await this.userModel.find(query).exec();
    return users;
  }
}
