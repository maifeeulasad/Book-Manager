import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Author } from "./AuthorSchema";
import { CreateAuthorDto, UpdateAuthorDto } from "./AuthorDto";

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name) private readonly authorModel: Model<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    return await this.authorModel.create(createAuthorDto);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: Author[]; count: number }> {
    const { page, limit, search } = options;
    const filter = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const count = await this.authorModel.countDocuments(filter).exec();
    const data = await this.authorModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { data, count };
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorModel.findById(id).exec();
    if (!author) {
      throw new NotFoundException(`Author with ID '${id}' not found`);
    }
    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const updated = await this.authorModel
      .findByIdAndUpdate(id, updateAuthorDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Author with ID '${id}' not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.authorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Author with ID '${id}' not found`);
    }
  }
}
