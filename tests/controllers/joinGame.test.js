import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { Player } from "../../src/data/models/userModel.js";
import { Game } from "../../src/data/models/gameModel.js";
import { jest } from "@jest/globals";

let mongoServer;
const TEST_SECRET = "testsecret";

beforeAll(async () => {
  jest.setTimeout(500000); 
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  process.env.SECRET_KEY = TEST_SECRET; 
},500000 );

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Player.deleteMany({});
  await Game.deleteMany({});
});

describe("POST /game/:gameId/join", () => {
  it("Debe devolver error 401 si no se envía un token", async () => {
    const response = await request(app).post("/games/12345/join");
    expect(response.status).toBe(401);
  });

  it("Debe devolver error 404 si el juego no existe", async () => {
    const userToken = jwt.sign({ id: "12345", email: "test@example.com" }, TEST_SECRET);

    const response = await request(app)
      .post("/game/invalidGameId/join")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });

  it("Debe devolver error 400 si el usuario ya está en el juego", async () => {
    const user = new Player({ name: "Jugador1", age: 24, email: "jugador1@example.com", password: "password123" });
    await user.save();
  
    const game = new Game({
      title: "Juego de prueba",
      status: "pending",
      maxPlayers: 2,
      creator: user._id.toString(),
      players: [user._id], 
    });
    await game.save();
  
    const userToken = jwt.sign({ id: user._id.toString(), email: user.email }, TEST_SECRET);
  
    const response = await request(app)
      .post(`/games/${game._id}/join`)
      .set("Authorization", `Bearer ${userToken}`);
  
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Ya estás en este juego");
  });
  

  it("Debe devolver error 400 si el juego ya está lleno", async () => {
    const user = new Player({ name: "Jugador2",age: 22, email: "jugador2@example.com", password: "password123" });
    const user1 = new Player({ name: "Jugador2",age: 22, email: "jugador2@example.com", password: "password123" });
    const user2 = new Player({ name: "Jugador2",age: 22, email: "jugador2@example.com", password: "password123" });


    await user.save();

    const game = new Game({
      title: "Juego de prueba",
      status: "pending",
      maxPlayers: 2,
      creator: user._id.toString(), 
      players: [user1._id, user2._id], 
    });
    await game.save();

    const userToken = jwt.sign({ id: user._id.toString(), email: user.email }, TEST_SECRET);

    const response = await request(app)
      .post(`/games/${game._id}/join`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "El juego ya está lleno");
  });

  it("Debe permitir unirse al juego si todo es válido", async () => {
    const user = new Player({ name: "Jugador3",age: 22,  email: "jugador3@example.com", password: "password123" });
    await user.save();

    const game = new Game({
        title: "Juego de prueba",
        status: "pending",
        maxPlayers: 2,
        creator: user._id.toString(), 
    });

    await game.save();

    const userToken = jwt.sign({ id: user._id.toString(), email: user.email }, TEST_SECRET);

    const response = await request(app)
      .post(`/games/${game._id}/join`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Te has unido al juego");

    // Verificar que el usuario se agregó al juego en la BD
    const updatedGame = await Game.findById(game._id);
    expect(updatedGame.players).toContainEqual(user._id);
  });
});
