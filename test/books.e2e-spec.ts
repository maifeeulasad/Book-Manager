import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongoModule } from '../src/db/MongoModule';
import { AppModule } from '../src/app.module';

describe('BooksController (e2e)', () => {
  let app: INestApplication;
  let authorId: string;
  let bookId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongoModule, AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const authorRes = await request(app.getHttpServer())
      .post('/authors')
      .send({ firstName: 'BookAuthor_' + Date.now(), lastName: 'E2E' })
      .expect(201);
    authorId = authorRes.body._id;
  });



  afterAll(async () => {
    await app.close();
  });

  it('GET /books should return empty data and count=0 initially', async () => {
    const res = await request(app.getHttpServer())
      .get('/books')
      .query({ authorId })
      .expect(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it('POST /books should reject invalid ISBN', async () => {
    await request(app.getHttpServer())
      .post('/books')
      .send({ title: 'Invalid', isbn: '1234', author: authorId })
      .expect(400)
      .expect(res => {
        expect(res.body.message).toEqual(
          expect.arrayContaining([
            expect.stringContaining('isbn is not a valid ISBN-10 or ISBN-13'),
          ]),
        );
      });
  });

  it('POST /books should create book with valid ISBN', async () => {
    const createDto = {
      title: 'E2E Book ' + Date.now(),
      isbn: '978-1-23456-789-7',
      publishedDate: '2020-01-01',
      genre: 'Test',
      author: authorId,
    };
    const res = await request(app.getHttpServer())
      .post('/books')
      .send(createDto)
      .expect(201);
    expect(res.body.title).toBe(createDto.title);
    expect(res.body.isbn).toBe(createDto.isbn);
    expect(res.body.author._id).toBe(authorId);
    bookId = res.body._id;
  });

  it('GET /books should return one book after create', async () => {
    const res = await request(app.getHttpServer())
      .get('/books')
      .query({ authorId })
      .expect(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0]._id).toBe(bookId);
  });

  it('GET /books/:id should return the created book', async () => {
    const res = await request(app.getHttpServer())
      .get(`/books/${bookId}`)
      .expect(200);
    expect(res.body._id).toBe(bookId);
    expect(res.body.genre).toBe('Test');
  });

  it('PATCH /books/:id should update the book', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/books/${bookId}`)
      .send({ genre: 'Updated' })
      .expect(200);
    expect(res.body.genre).toBe('Updated');
  });

  it('DELETE /books/:id should remove the book', async () => {
    await request(app.getHttpServer())
      .delete(`/books/${bookId}`)
      .expect(204);
  });

  it('GET /books should return empty and count=0 after delete', async () => {
    const res = await request(app.getHttpServer())
      .get('/books')
      .query({ authorId })
      .expect(200);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  it('GET /books/:id for deleted should return 404', async () => {
    await request(app.getHttpServer())
      .get(`/books/${bookId}`)
      .expect(404)
      .expect(res => {
        expect(res.body.message).toBe(`Book with ID '${bookId}' not found`);
      });
  });
});
