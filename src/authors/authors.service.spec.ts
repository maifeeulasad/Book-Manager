import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthorsService } from "./authors.service";
import { Author } from "./AuthorSchema";
import { CreateAuthorDto, UpdateAuthorDto } from "./AuthorDto";

const mockAuthor = {
  _id: "507f1f77bcf86cd799439011",
  firstName: `John-${new Date().toISOString()}`,
  lastName: "Doe",
  bio: "Sample bio",
  birthDate: new Date("1990-01-01"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("AuthorsService", () => {
  let service: AuthorsService;
  let model: any;

  beforeEach(async () => {
    const modelMock = {
      create: jest.fn((dto) => ({ _id: mockAuthor._id, ...dto })),

      find: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      }),
      countDocuments: jest.fn(),

      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAuthor) }),
      findByIdAndUpdate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAuthor) }),
      findByIdAndDelete: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAuthor) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: getModelToken(Author.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    model = module.get<Model<Author>>(getModelToken(Author.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an author and update count", async () => {
      const dto: CreateAuthorDto = {
        firstName: mockAuthor.firstName,
        lastName: mockAuthor.lastName,
      };

      model.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) });

      const { count: beforeCount } = await service.findAll({
        page: 1,
        limit: 10,
        search: mockAuthor.firstName,
      });
      expect(beforeCount).toBe(0);

      const result = await service.create(dto);
      expect(model.create).toHaveBeenCalledWith(dto);
      expect(result._id).toBe(mockAuthor._id);

      const { count: afterCount } = await service.findAll({
        page: 1,
        limit: 10,
        search: mockAuthor.firstName,
      });
      expect(afterCount).toBe(1);
    });
  });

  describe("findAll", () => {
    it("should return authors array and count", async () => {
      const authorsArray = [mockAuthor];
      model.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(authorsArray),
      });
      model.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(authorsArray.length),
      });

      const { data, count } = await service.findAll({
        page: 1,
        limit: 10,
        search: undefined,
      });
      expect(model.find).toHaveBeenCalled();
      expect(data).toEqual(authorsArray);
      expect(count).toBe(authorsArray.length);
    });
  });

  describe("findOne", () => {
    it("should return a single author", async () => {
      const result = await service.findOne(mockAuthor._id);
      expect(model.findById).toHaveBeenCalledWith(mockAuthor._id);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe("update", () => {
    it("should update and return the author", async () => {
      const dto: UpdateAuthorDto = { bio: "Updated bio" };
      const result = await service.update(mockAuthor._id, dto);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAuthor._id,
        dto,
        { new: true },
      );
      expect(result).toEqual(mockAuthor);
    });
  });

  describe("remove", () => {
    it("should delete the author and decrement count", async () => {
      model.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) });

      const { count: beforeCount } = await service.findAll({
        page: 1,
        limit: 10,
        search: mockAuthor.firstName,
      });
      expect(beforeCount).toBe(1);

      await service.remove(mockAuthor._id);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockAuthor._id);

      const { count: afterCount } = await service.findAll({
        page: 1,
        limit: 10,
        search: mockAuthor.firstName,
      });
      expect(afterCount).toBe(0);
    });
  });
});
