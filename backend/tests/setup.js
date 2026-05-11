process.env.NODE_ENV = "test";
const mongoose = require("mongoose");
const models = require("../models");

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/db_todoapp_test";
  await mongoose.connect(mongoUri);
  global.models = models;
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
