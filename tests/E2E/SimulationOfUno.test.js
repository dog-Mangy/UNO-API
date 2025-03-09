import fetch from "node-fetch";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js";
import { Player } from "../../src/data/models/userModel.js";
import { Game } from "../../src/data/models/gameModel.js";
import { Card } from "../../src/data/models/cardModel.js";
import { createServer } from "http";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

let mongoServer;
let server;
let registeredUser;
let registeredUser2;
let game;
let card;
let authToken;
let authToken2;

const PORT = 3002;
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
  await Game.deleteMany({});
  await Card.deleteMany({});

  // 🟢 Crear usuarios
  const hashedPassword = await bcrypt.hash("password123", 10);
  registeredUser = new Player({
    name: "TestPlayer",
    age: 30,
    email: "testplayer@example.com",
    password: hashedPassword,
  });
  await registeredUser.save();

  registeredUser2 = new Player({
    name: "TestPlayer2",
    age: 30,
    email: "testplayer2@example.com",
    password: hashedPassword,
  });
  await registeredUser2.save();

  // 🟢 Iniciar sesión y obtener tokens
  const loginRes1 = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "testplayer@example.com", password: "password123" }),
  });
  const loginData1 = await loginRes1.json();
  authToken = loginData1.token;

  const loginRes2 = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "testplayer2@example.com", password: "password123" }),
  });
  const loginData2 = await loginRes2.json();
  authToken2 = loginData2.token;

  // 🟢 Crear juego
  game = new Game({
    title: "Juego",
    players: [registeredUser._id, registeredUser2._id],
    creator: registeredUser._id,
    maxPlayers: 4,
    turnIndex: 0,
    status: "pending",
  });
  await game.save();

  await fetch(`${API_URL}/games/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ game_id: game._id }),
  });

  // 🟢 Crear carta
  card = new Card({
    color: "red",
    value: "5",
    playerId: registeredUser._id,
    gameId: game._id,
  });
  await card.save();
});

describe("E2E - Validaciones de Jugabilidad", () => {
  it("Debe impedir jugar fuera de turno", async () => {
    game.turnIndex = 1;
    await game.save();

    const res = await fetch(`${API_URL}/cards/play`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ gameId: game._id, cardId: card._id }),
    });

    const data = await res.json();
    expect(res.status).toBe(405);
    expect(data).toHaveProperty("message", "It's not your turn.");
  });

  it("Debe impedir jugar una carta si el juego ya terminó", async () => {
    game.status = "finished";
    await game.save();

    const res = await fetch(`${API_URL}/cards/play`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ gameId: game._id, cardId: card._id }),
    });

    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data).toHaveProperty("message", "The game has already ended");
  });
});
