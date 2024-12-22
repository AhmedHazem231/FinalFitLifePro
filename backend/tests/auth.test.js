// tests/auth.test.js
const request = require("supertest");
const app = require("../index");
const dbHandler = require("./setup");
const User = require("../models/User");

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe("Authentication Tests", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  };

  describe("POST /api/auth/signup", () => {
    it("should create a new user", async () => {
      const res = await request(app).post("/api/auth/signup").send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", testUser.email);
    });

    it("should not create user with existing email", async () => {
      await User.create(testUser);

      const res = await request(app).post("/api/auth/signup").send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Email already registered");
    });
  });

  describe("POST /api/auth/signin", () => {
    beforeEach(async () => {
      await User.create(testUser);
    });

    it("should login with correct credentials", async () => {
      const res = await request(app).post("/api/auth/signin").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should not login with incorrect password", async () => {
      const res = await request(app).post("/api/auth/signin").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
