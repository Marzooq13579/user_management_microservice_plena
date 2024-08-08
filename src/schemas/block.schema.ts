import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Block extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  blockedUserId: string;
}

export const BlockSchema = SchemaFactory.createForClass(Block);
