import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js";
import { Player } from "../../src/data/models/userModel.js";
import { jest } from "@jest/globals";
import bcrypt from "bcrypt";

let mongoServer;

beforeAll(async () => {
  jest.setTimeout(500000);
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 500000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Player.deleteMany({});
});

describe("POST /login", () => {
  it("Debe iniciar sesión correctamente y devolver un token", async () => {
    // Crear un usuario con contraseña hasheada
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = new Player({
      name: "Jugador1",
      age: 22, 
      email: "jugador1@example.com",
      password: hashedPassword,
    });
    await user.save();

    const response = await request(app)
      .post("/auth")
      .send({ email: "jugador1@example.com", password: "password123" });

    // Verificar respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Inicio de sesión exitoso");
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });

  it("Debe devolver error 404 si el usuario no existe", async () => {
    const response = await request(app)
      .post("/auth")
      .send({ email: "noexiste@example.com", password: "password123" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Credenciales inválidas");
  });

  it("Debe devolver error 400 si faltan campos obligatorios", async () => {
    const response = await request(app).post("/auth").send({ email: "jugador1@example.com" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "El correo y la contraseña son obligatorios");
  });

  it("Debe devolver error 404 si la contraseña es incorrecta", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = new Player({
      name: "Jugador1", 
      age: 20, 
      email: "jugador1@example.com",
      password: hashedPassword,
    });
    await user.save();

    const response = await request(app)
      .post("/auth")
      .send({ email: "jugador1@example.com", password: "wrongpassword" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Credenciales inválidas");
  });
});
