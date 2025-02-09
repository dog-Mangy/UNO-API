import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import { tokenBlacklist } from "../../src/presentation/controllers/auth.js";

let mongoServer;
const TEST_SECRET = "testsecret";

beforeAll(async () => {
  jest.setTimeout(500000);
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  process.env.SECRET_KEY = TEST_SECRET;
},500000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(() => {
  tokenBlacklist.clear(); // Limpiar la blacklist antes de cada prueba
});

describe("POST /logout", () => {
  it("Debe devolver error 400 si no se envía un token", async () => {
    const response = await request(app).post("/logout");
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Acceso denegado: No hay token");
  });

  it("Debe devolver error 403 si el token es inválido", async () => {
    const response = await request(app)
      .post("/logout")
      .set("Authorization", "Bearer token_invalido");

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "Token no válido");
  });

  it("Debe cerrar sesión correctamente y agregar el token a la blacklist", async () => {
    // Crear un token válido
    const validToken = jwt.sign({ id: "12345", email: "test@example.com" }, TEST_SECRET, { expiresIn: "1h" });

    // Hacer la petición de logout con el token
    const response = await request(app)
      .post("/logout")
      .set("Authorization", `Bearer ${validToken}`);

    // Verificar respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Cierre de sesión exitoso");

    // Verificar que el token está en la blacklist
    expect(tokenBlacklist.has(validToken)).toBe(true);
  });
});
