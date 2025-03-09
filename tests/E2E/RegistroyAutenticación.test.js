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

describe("E2E - Registro y Autenticación de Usuario", () => {
  it("Debe registrar un usuario correctamente e iniciar sesión", async () => {
    const newUser = {
      name: "TestUser",
      age: 25,
      email: "test@example.com",
      password: "password123",
    };

    // 🟢 1️⃣ Registrar usuario
    const registerRes = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const registerData = await registerRes.json();
    expect(registerRes.status).toBe(201);
    expect(registerData).toHaveProperty("message", "User registered successfully");
    expect(registerData.user).toHaveProperty("name", "TestUser");
    expect(registerData.user).toHaveProperty("email", "test@example.com");

    // 🟢 2️⃣ Iniciar sesión con el usuario registrado
    const loginRes = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newUser.email, password: newUser.password }),
    });

    const loginData = await loginRes.json();
    expect(loginRes.status).toBe(200);
    expect(loginData).toHaveProperty("message", "Login successful");
    expect(loginData).toHaveProperty("token");
    expect(typeof loginData.token).toBe("string");
  });

  it("No debe permitir iniciar sesión con credenciales incorrectas", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const registeredUser = new Player({
      name: "Jugador1",
      age: 22,
      email: "jugador1@example.com",
      password: hashedPassword,
    });
    await registeredUser.save();

    const res = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: registeredUser.email, password: "wrongpassword" }),
    });

    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data).toHaveProperty("message", "Invalid credentials");
  });
});
