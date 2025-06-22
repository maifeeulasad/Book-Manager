import { IsString, IsOptional, IsDateString, IsMongoId } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { IsValidISBN } from './BookValidator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsValidISBN()
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
