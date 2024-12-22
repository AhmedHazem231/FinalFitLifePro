// tests/metrics.test.js
const request = require("supertest");
const app = require("../index");
const dbHandler = require("./setup");
const User = require("../models/User");
const { generateToken } = require("../utils/auth");

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe("Metrics Tests", () => {
  let token;
  let user;

  beforeEach(async () => {
    user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    });
    token = generateToken(user._id);
  });

  describe("POST /api/metrics/update", () => {
    it("should update user metrics", async () => {
      const metrics = {
        weight: 70,
        height: 175,
        age: 25,
        gender: "male",
      };

      const res = await request(app)
        .post("/api/metrics/update")
        .set("Authorization", `Bearer ${token}`)
        .send(metrics);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.metrics).toHaveProperty("bmi");
      expect(res.body.data.metrics.weight).toBe(metrics.weight);
    });
  });
});
