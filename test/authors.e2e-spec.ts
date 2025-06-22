import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { MongoModule } from "../src/db/MongoModule";
import { AppModule } from "../src/app.module";

describe("AuthorsController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongoModule, AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should manage author lifecycle with counts", async () => {
    const createDto = {
      firstName: "E2E_" + Date.now(),
      lastName: "Tester",
      bio: "E2E testing bio",
      birthDate: "1970-01-01",
    };

    const beforeRes = await request(app.getHttpServer())
      .get("/authors")
      .query({ search: createDto.firstName })
      .expect(200);
    expect(beforeRes.body.count).toBe(0);

    const postRes = await request(app.getHttpServer())
      .post("/authors")
      .send(createDto)
      .expect(201);
    const authorId = postRes.body._id;
    expect(postRes.body.firstName).toBe(createDto.firstName);

    const afterCreateRes = await request(app.getHttpServer())
      .get("/authors")
      .query({ search: createDto.firstName })
      .expect(200);
    expect(afterCreateRes.body.count).toBe(1);

    const getRes = await request(app.getHttpServer())
      .get(`/authors/${authorId}`)
      .expect(200);
    expect(getRes.body._id).toBe(authorId);
    expect(getRes.body.lastName).toBe(createDto.lastName);

    await request(app.getHttpServer())
      .delete(`/authors/${authorId}`)
      .expect(204);

    const afterDeleteRes = await request(app.getHttpServer())
      .get("/authors")
      .query({ search: createDto.firstName })
      .expect(200);
    expect(afterDeleteRes.body.count).toBe(0);

    await request(app.getHttpServer())
      .get(`/authors/${authorId}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe(`Author with ID '${authorId}' not found`);
      });
  });
});
