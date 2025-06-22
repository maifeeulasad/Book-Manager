import { Module } from "@nestjs/common";
import { AuthorsModule } from "./authors/authors.module";
import { BooksModule } from "./books/books.module";
import { MongoModule } from "./db/MongoModule";

@Module({
  imports: [MongoModule, AuthorsModule, BooksModule],
})
export class AppModule {}
