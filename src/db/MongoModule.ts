import { MongooseModule } from "@nestjs/mongoose";

export const CONNECTION_STRING_FALLBACK = 'mongodb://root:example@localhost:27017/library?authSource=admin';
const CONNECTION_STRING = process.env.MONGO_URI || CONNECTION_STRING_FALLBACK;

if (CONNECTION_STRING === CONNECTION_STRING_FALLBACK) {
    console.warn('Using fallback MongoDB connection string:', CONNECTION_STRING);
}

export const MongoModule = MongooseModule.forRoot(
    CONNECTION_STRING, 
    {}
);