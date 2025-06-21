import { IsString, IsOptional, IsDateString, IsISBN, IsMongoId } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsISBN()
  isbn: string;

  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsMongoId()
  author: string;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}
