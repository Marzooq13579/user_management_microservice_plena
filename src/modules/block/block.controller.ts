import { Controller, Post, Delete, Param, Req } from '@nestjs/common';
import { BlockService } from './block.service';
import { CustomRequest } from 'src/middlewares/jwt.middleware';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post(':blockedUserId')
  blockUser(
    @Param('blockedUserId') blockedUserId: string,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;
    return this.blockService.blockUser(userId, blockedUserId);
  }

  @Delete(':blockedUserId')
  unblockUser(
    @Param('blockedUserId') blockedUserId: string,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;
    return this.blockService.unblockUser(userId, blockedUserId);
  }
}
