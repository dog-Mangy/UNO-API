import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js";
import { Player } from "../../src/data/models/userModel.js";
import { Game } from "../../src/data/models/gameModel.js";
import dotenv from "dotenv";
import { createServer } from "http";

dotenv.config();

let mongoServer;
const TEST_SECRET = "testsecret";
let server;
const PORT = 3001;
const API_URL = `http://localhost:${PORT}`;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  process.env.SECRET_KEY = TEST_SECRET;
  server = createServer(app);
  server.listen(PORT);
},45000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  server.close();
});

beforeEach(async () => {
  await Player.deleteMany({});
  await Game.deleteMany({});
});

describe("E2E - Creación y gestión de partidas", () => {
  let user1, user1Token, user2, user2Token, gameId;

  beforeEach(async () => {
    user1 = new Player({ name: "Jugador1", age: 22, email: "jugador1@example.com", password: "password123" });
    await user1.save();
    user1Token = jwt.sign({ id: user1._id.toString(), email: user1.email }, TEST_SECRET);

    user2 = new Player({ name: "Jugador2", age: 22, email: "jugador2@example.com", password: "password123" });
    await user2.save();
    user2Token = jwt.sign({ id: user2._id.toString(), email: user2.email }, TEST_SECRET);
  });

  it("Debe permitir a un usuario crear una partida", async () => {
    const newGame = {
      title: "Juego de prueba",
      status: "pending",
      maxPlayers: 2,
    };

    const response = await fetch(`${API_URL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user1Token}`,
      },
      body: JSON.stringify(newGame),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data).toHaveProperty("_id");
    expect(data).toHaveProperty("title", "Juego de prueba");
    expect(data).toHaveProperty("status", "pending");
    expect(data).toHaveProperty("maxPlayers", 2);
    expect(data).toHaveProperty("creator", user1._id.toString());

    gameId = data._id;
  });

  it("Debe permitir a otro usuario unirse a la partida", async () => {
    const gameResponse = await fetch(`${API_URL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user1Token}`,
      },
      body: JSON.stringify({ title: "Juego de prueba", status: "pending", maxPlayers: 2 }),
    });

    const gameData = await gameResponse.json();
    expect(gameResponse.status).toBe(201);
    gameId = gameData._id;

    const joinResponse = await fetch(`${API_URL}/games/${gameId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user2Token}`,
      },
    });

    const joinData = await joinResponse.json();
    expect(joinResponse.status).toBe(200);
    expect(joinData).toHaveProperty("message", "You have joined the game");
  });
});
