import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block } from 'src/schemas/block.schema';
import { RedisService } from '../redis/redis.service';
import { invalidateUserCache } from 'src/utils/invalidateUserCache';

@Injectable()
export class BlockService implements OnModuleInit {
  private redisClient;

  constructor(
    @InjectModel(Block.name) private blockModel: Model<Block>,
    private redisService: RedisService,
  ) {}

  onModuleInit() {
    this.redisClient = this.redisService.getClient();
  }

  async blockUser(userId: string, blockedUserId: string) {
    const existingBlock = await this.blockModel
      .findOne({ userId, blockedUserId })
      .exec();

    if (existingBlock) {
      return existingBlock;
    }
    const block = new this.blockModel({ userId, blockedUserId });
    const savedBlock = await block.save();

    await invalidateUserCache(this.redisClient, userId);
    return savedBlock;
  }

  async unblockUser(userId: string, blockedUserId: string) {
    const result = await this.blockModel
      .findOneAndDelete({ userId, blockedUserId })
      .exec();
    if (!result) {
      throw new NotFoundException(`user_not_found_in_blocklist`);
    }

    await invalidateUserCache(this.redisClient, userId);

    return result;
  }

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const blocks = await this.blockModel.find({ userId }).exec();
    return blocks.map((block) => block.blockedUserId);
  }
}
