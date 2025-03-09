import fetch from "node-fetch";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js";
import { Player } from "../../src/data/models/userModel.js";
import { createServer } from "http";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

let mongoServer;
let server;
const PORT = 3001;
const API_URL = `http://localhost:${PORT}`;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  server = createServer(app);
  server.listen(PORT);
}, 500000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  server.close();
});

beforeEach(async () => {
  await Player.deleteMany({});
});

describe("E2E - Casos negativos de Registro y Autenticación", () => {
  it("No debe permitir registrar un usuario sin datos válidos", async () => {
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data).toHaveProperty("message", "All fields are required");
  });

  it("No debe permitir registrar un usuario con un email ya registrado", async () => {
    const userData = {
      name: "TestUser",
      age: 25,
      email: "test@example.com",
      password: "password123",
    };

    await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data).toHaveProperty("message", "Email already registered");
  });

  it("No debe permitir iniciar sesión con un email no registrado", async () => {
    const res = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unregistered@example.com", password: "password123" }),
    });

    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data).toHaveProperty("message", "User not found");
  });

  it("No debe permitir iniciar sesión con contraseña incorrecta", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = new Player({
      name: "TestUser",
      age: 25,
      email: "test@example.com",
      password: hashedPassword,
    });
    await user.save();

    const res = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "wrongpassword" }),
    });

    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data).toHaveProperty("message", "Invalid credentials");
  });
});
