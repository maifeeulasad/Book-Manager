import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { IsIsbnValidate } from "./BookValidator";

@Schema({ timestamps: true })
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true, validate: IsIsbnValidate() })
  isbn: string;

  @Prop()
  publishedDate?: Date;

  @Prop()
  genre?: string;

  @Prop({ type: Types.ObjectId, ref: "Author", required: true })
  author: Types.ObjectId;
}

export const BookSchema = SchemaFactory.createForClass(Book);
