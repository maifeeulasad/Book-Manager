import { MongooseModule } from "@nestjs/mongoose";

const CONNECTION_STRING_FALLBACK = 'mongodb://localhost:27017/library';
const CONNECTION_STRING = process.env.MONGO_URI || CONNECTION_STRING_FALLBACK;

if (CONNECTION_STRING === CONNECTION_STRING_FALLBACK) {
    console.warn('Using fallback MongoDB connection string:', CONNECTION_STRING);
}

export const MongoModule = MongooseModule.forRoot(
    CONNECTION_STRING, 
    {}
);