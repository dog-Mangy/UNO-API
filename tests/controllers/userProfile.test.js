import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { Player } from "../../src/data/models/userModel.js";
import { jest } from "@jest/globals";

let mongoServer;
const TEST_SECRET = "testsecret"; // Clave secreta para los tests

beforeAll(async () => {
  jest.setTimeout(500000);
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  process.env.SECRET_KEY = TEST_SECRET; // Definir clave de prueba
},500000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Player.deleteMany({}); 
});

describe("GET /profile", () => {
  it("Debe devolver error 401 si no se envía un token", async () => {
    const response = await request(app).get("/profile");
    expect(response.status).toBe(401);
  });

  it("Debe devolver el perfil del usuario si el token es válido", async () => {
    const user = new Player({
      name: "Jugador1",
      age: 22,
      email: "jugador1@example.com",
      password: "password123", 
    });
    await user.save();

    const validToken = jwt.sign({ id: user._id.toString(), email: user.email }, TEST_SECRET);

    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      username: user.name,
      email: user.email,
    });
  });
});
