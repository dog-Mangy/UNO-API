import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js";
import { Score } from "../../src/data/models/scoreModel.js";
import { Player } from "../../src/data/models/userModel.js";
import { Game } from "../../src/data/models/gameModel.js";
import { jest } from "@jest/globals";

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
  await Score.deleteMany({});
  await Player.deleteMany({});
  await Game.deleteMany({});
});

describe("POST /scores", () => {
  it("Debe registrar un puntaje correctamente", async () => {
    const player = new Player({
      name: "Jugador1",
      age: 20,
      email: "jugador1@example.com",
      password: "password123",
    });
    await player.save();

    const game = new Game({
      title: "Juego de prueba",
      status: "pending",
      maxPlayers: 4,
      creator: player._id,
    });
    await game.save();

    const newScore = {
      playerId: player._id.toString(),
      gameId: game._id.toString(),
      baseScore: 100
    };

    const response = await request(app).post("/scores").send(newScore);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("playerId", player._id.toString());
    expect(response.body).toHaveProperty("gameId", game._id.toString());
    expect(response.body).toHaveProperty("score", 100);

    const scoreInDb = await Score.findById(response.body._id);
    expect(scoreInDb).not.toBeNull();
  });

  it("Debe devolver error si faltan campos obligatorios", async () => {
    const response = await request(app).post("/scores").send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "All fields are required");
  });
});

describe("GET /scores", () => {
    it("Debe devolver una lista vacía si no hay puntajes", async () => {
      const response = await request(app).get("/scores");
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "No scores found");
    });
  
    it("Debe devolver una lista con puntajes", async () => {
      const player = new Player({ name: "Jugador1", age: 20, email: "jugador1@example.com", password: "password123",});
      await player.save();
  
      const game = new Game({title: "Juego de prueba", status: "pending", maxPlayers: 4, creator: player._id, });
      await game.save();
  
      const score1 = new Score({ playerId: player._id, gameId: game._id, score: 150 });
      const score2 = new Score({ playerId: player._id, gameId: game._id, score: 200 });
      await score1.save();
      await score2.save();
  
      const response = await request(app).get("/scores");
  
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty("playerId", player._id.toString());
      expect(response.body[0]).toHaveProperty("gameId", game._id.toString());
      expect(response.body[0]).toHaveProperty("score", 150);
      expect(response.body[1]).toHaveProperty("score", 200);
    });
  });

  describe("GET /scores/:id", () => {
    it("Debe devolver un puntaje por ID", async () => {
      const player = new Player({name: "Jugador1", age: 20, email: "jugador1@example.com", password: "password123", });
      await player.save();
  
      const game = new Game({title: "Juego de prueba", status: "pending", maxPlayers: 4, creator: player._id, });
      await game.save();
  
      const score = new Score({ playerId: player._id, gameId: game._id, score: 150 });
      await score.save();
  
      const response = await request(app).get(`/scores/${score._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", score._id.toString());
      expect(response.body).toHaveProperty("playerId", player._id.toString());
      expect(response.body).toHaveProperty("gameId", game._id.toString());
      expect(response.body).toHaveProperty("score", 150);
    });
  
    it("Debe devolver error 404 si el puntaje no existe", async () => {
      const nonExistentId = new mongoose.Types.ObjectId(); 
      const response = await request(app).get(`/scores/${nonExistentId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Score not found");
    });
  });

  describe("GET /scores/ScoresPlayers/:game_id", () => {
    it("Debe devolver las puntuaciones de un juego", async () => {
      const player1 = new Player({ name: "Jugador1", age: 20, email: "jugador1@example.com", password: "password123" });
      const player2 = new Player({ name: "Jugador2", age: 22, email: "jugador2@example.com", password: "password123" });
      await player1.save();
      await player2.save();
  
      const game = new Game({ title: "Juego de prueba", status: "pending", maxPlayers: 4, creator: player1._id });
      await game.save();
  
      const score1 = new Score({ playerId: player1._id, gameId: game._id, score: 150 });
      const score2 = new Score({ playerId: player2._id, gameId: game._id, score: 200 });
      await score1.save();
      await score2.save();
  
      const response = await request(app).get(`/scores/ScoresPlayers/${game._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("gameId", game._id.toString());
      expect(response.body.scores).toEqual({
        Jugador1: 150,
        Jugador2: 200
      });
    });
  
    it("Debe devolver error 400 si no se proporciona game_id", async () => {
      const response = await request(app).get("/scores/ScoresPlayers/");
  
      expect(response.status).toBe(500); 
    });
  
    it("Debe devolver error 404 si el juego no existe", async () => {
      const nonExistentGameId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/scores/ScoresPlayers/${nonExistentGameId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ error: true, message: "Game not found" });
    });
  
    it("Debe devolver error 400 si no hay puntuaciones registradas", async () => {
      const game = new Game({ title: "Juego sin puntajes", status: "pending", maxPlayers: 4, creator: new mongoose.Types.ObjectId() });
      await game.save();
  
      const response = await request(app).get(`/scores/ScoresPlayers/${game._id}`);
  
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: true,
        message: "No scores registered"
      });
    

    });
  });


  describe("PUT /scores/:id", () => {
    let score;

    beforeEach(async () => {
        score = new Score({ playerId: new mongoose.Types.ObjectId(), gameId: new mongoose.Types.ObjectId(), score: 100 });
        await score.save();
    });

    afterEach(async () => {
        await Score.deleteMany(); 
    });

    it("Debe actualizar correctamente una puntuacion y devolver 200", async () => {
        const response = await request(app)
            .put(`/scores/${score._id}`)
            .send({ score: 150 })
            .expect(200);

        expect(response.body).toHaveProperty("message", "Score updated successfully");
        expect(response.body.updatedScore).toHaveProperty("score", 150);
    });

    it("Debe devolver 404 si la carta no existe", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .put(`/scores/${nonExistentId}`)
            .send({ score: 200 })
            .expect(404);

            expect(response.body).toMatchObject({ error: true, message: "Score not found" });

          });
});


describe("DELETE /scores/:id", () => {
  let player1, game, score;

  beforeEach(async () => {
      player1 = await Player.create({
          name: "Jugador1",
          age: 20,
          email: "jugador1@example.com",
          password: "password123"
      });

      game = await Game.create({
          title: "Juego de prueba",
          status: "pending",
          maxPlayers: 4,
          creator: player1._id
      });

      score = await Score.create({
          playerId: player1._id,
          gameId: game._id,
          score: 150
      });
  });

  afterAll(async () => {
      await mongoose.connection.close();
  });

  test("Debe eliminar una puntuación existente y devolver 200", async () => {
      const response = await request(app)
          .delete(`/scores/${score._id}`)
          .expect(200);

      expect(response.body).toHaveProperty("message", "Score eliminated successfully");
      expect(response.body).toHaveProperty("deletedScore");
      expect(response.body.deletedScore._id).toBe(score._id.toString());


      const scoreInDb = await Score.findById(score._id);
      expect(scoreInDb).toBeNull();
  });

  test("Debe devolver 404 si la puntuación no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
        .delete(`/scores/${fakeId}`)
        .expect(404);

    expect(response.body).toMatchObject({error: true, message: "Score not found"});
});
});