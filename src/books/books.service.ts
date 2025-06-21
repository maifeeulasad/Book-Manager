import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Book } from './BookSchema';
import { Author } from '../authors/AuthorSchema';
import { CreateBookDto, UpdateBookDto } from './BookDto';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Author.name) private readonly bookModel: Model<Book>,
    @InjectModel(Author.name) private readonly authorModel: Model<Author>,
  ) { }

  async create(dto: CreateBookDto): Promise<Book> {
    if (!Types.ObjectId.isValid(dto.author)) {
      throw new BadRequestException('Invalid authorId');
    }
    const author = await this.authorModel.findById(dto.author).exec();
    if (!author) {
      throw new BadRequestException('Author not found');
    }
    const created = new this.bookModel({
      title: dto.title,
      isbn: dto.isbn,
      publishedDate: dto.publishedDate,
      genre: dto.genre,
      author: dto.author,
    });
    return created.save().then(book => book.populate('author'));
  }

  async findAll(options: { page: number; limit: number; search?: string; authorId?: string; }): Promise<{ data: Book[]; count: number }> {
    const { page, limit, search, authorId } = options;
    const filter: any = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { isbn: regex }];
    }
    if (authorId) {
      if (!Types.ObjectId.isValid(authorId)) {
        throw new BadRequestException('Invalid authorId filter');
      }
      filter.author = authorId;
    }

    const count = await this.bookModel.countDocuments(filter).exec();
    const data = await this.bookModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author')
      .exec();

    return { data, count };
  }

  async findOne(id: string): Promise<Book> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid book ID');
    }
    const book = await this.bookModel.findById(id).populate('author').exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async update(id: string, dto: UpdateBookDto): Promise<Book> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid book ID');
    }
    if (dto.author && !Types.ObjectId.isValid(dto.author)) {
      throw new BadRequestException('Invalid authorId');
    }
    if (dto.author) {
      const authorExists = await this.authorModel.exists({ _id: dto.author }).exec();
      if (!authorExists) {
        throw new BadRequestException('Author not found');
      }
    }

    const updated = await this.bookModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('author')
      .exec();
    if (!updated) {
      throw new NotFoundException('Book not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid book ID');
    }
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Book not found');
    }
  }
}
