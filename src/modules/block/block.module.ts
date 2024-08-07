import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';

@Module({
  providers: [BlockService],
  controllers: [BlockController],
})
export class BlockModule {}
