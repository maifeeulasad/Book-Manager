import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Book extends Document {

  @Prop({ required: true }) 
  title: string;

  @Prop({ required: true, unique: true }) 
  isbn: string;

  @Prop() 
  publishedDate?: Date;

  @Prop() 
  genre?: string;
  
  @Prop({ type: Types.ObjectId, ref: 'Author', required: true })
  author: Types.ObjectId;
}

export const BookSchema = SchemaFactory.createForClass(Book);