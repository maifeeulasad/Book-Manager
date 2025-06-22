import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Author extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  bio?: string;

  @Prop()
  birthDate?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Book" }] })
  books: Types.ObjectId[];
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
