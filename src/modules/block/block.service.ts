import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block } from 'src/schemas/block.schema';

@Injectable()
export class BlockService {
  constructor(@InjectModel(Block.name) private blockModel: Model<Block>) {}

  async blockUser(userId: string, blockedUserId: string) {
    const existingBlock = await this.blockModel
      .findOne({ userId, blockedUserId })
      .exec();

    if (existingBlock) {
      return existingBlock;
    }
    const block = new this.blockModel({ userId, blockedUserId });
    return await block.save();
  }

  async unblockUser(userId: string, blockedUserId: string) {
    const result = await this.blockModel
      .findOneAndDelete({ userId, blockedUserId })
      .exec();
    if (!result) {
      throw new NotFoundException(`user_not_found_in_blocklist`);
    }
    return result;
  }

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const blocks = await this.blockModel.find({ userId }).exec();
    return blocks.map((block) => block.blockedUserId);
  }
}
