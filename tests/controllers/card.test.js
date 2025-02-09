import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js";
import { Card } from "../../src/data/models/cardModel.js";
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
  await Card.deleteMany({});
  await Player.deleteMany({});
  await Game.deleteMany({});
});

describe("POST /cards", () => {
  it("Debe crear una carta correctamente", async () => {
    // Crear un jugador y un juego
    const player = new Player({ name: "Jugador1", age: 20, email: "jugador1@example.com", password: "password123" });
    await player.save();

    const game = new Game({ title: "Juego de prueba", status: "pending", maxPlayers: 4, creator: player._id });
    await game.save();

    // Datos de la carta
    const newCard = {
      color: "red",
      value: "5",
      playerId: player._id.toString(),
      gameId: game._id.toString(),
    };

    // Hacer la petición POST
    const response = await request(app).post("/cards").send(newCard);

    // Verificar respuesta
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("color", "red");
    expect(response.body).toHaveProperty("value", "5");
    expect(response.body).toHaveProperty("playerId", player._id.toString());
    expect(response.body).toHaveProperty("gameId", game._id.toString());

    // Verificar que la carta se guardó en la BD
    const cardInDb = await Card.findById(response.body._id);
    expect(cardInDb).not.toBeNull();
  });

  it("Debe devolver error 400 si faltan campos obligatorios", async () => {
    const response = await request(app).post("/cards").send({
      color: "red",
      value: "5",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Todos los campos son obligatorios");
  });
});


describe("GET /cards", () => {
    it("Debe devolver un error 404 si no hay cartas en la base de datos", async () => {
      const response = await request(app).get("/cards");
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "No se encontraron cartas");
    });
  
    it("Debe devolver una lista de cartas si existen en la base de datos", async () => {
      const player = new Player({ name: "Jugador1", age: 20, email: "jugador1@example.com", password: "password123" });
      await player.save();
  
      const game = new Game({ title: "Juego de prueba", status: "pending", maxPlayers: 4, creator: player._id });
      await game.save();
  
      const card1 = new Card({ color: "red", value: "5", playerId: player._id, gameId: game._id });
      const card2 = new Card({ color: "blue", value: "7", playerId: player._id, gameId: game._id });
  
      await Card.insertMany([card1, card2]);
  
      const response = await request(app).get("/cards");
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("color", "red");
      expect(response.body[1]).toHaveProperty("color", "blue");
    });
  });

  describe("GET /cards/:id", () => {
    it("Debe devolver una carta existente por su ID", async () => {
      const player = new Player({ name: "Jugador1", age: 20, email: "jugador1@example.com", password: "password123" });
      await player.save();
  
      const game = new Game({ title: "Juego de prueba", status: "pending", maxPlayers: 4, creator: player._id });
      await game.save();
  
      const card = new Card({ color: "green", value: "9", playerId: player._id, gameId: game._id });
      await card.save();
  
      const response = await request(app).get(`/cards/${card._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", card._id.toString());
      expect(response.body).toHaveProperty("color", "green");
      expect(response.body).toHaveProperty("value", "9");
      expect(response.body).toHaveProperty("playerId", player._id.toString());
      expect(response.body).toHaveProperty("gameId", game._id.toString());
    });
  
    it("Debe devolver error 404 si la carta no existe", async () => {
      const nonExistentId = new mongoose.Types.ObjectId(); 
  
      const response = await request(app).get(`/cards/${nonExistentId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Carta no encontrada");
    });
  });
  

  describe("PUT /cards/:id", () => {
    it("Debe actualizar una carta existente y devolver los datos actualizados", async () => {
      const player = new Player({ name: "Jugador1", age: 20, email: "jugador1@example.com", password: "password123" });
      await player.save();
  
      const game = new Game({ title: "Juego de prueba", status: "pending", maxPlayers: 4, creator: player._id });
      await game.save();
  
      const card = new Card({ color: "red", value: "5", playerId: player._id, gameId: game._id });
      await card.save();
  
      const updatedData = { color: "blue", value: "10" };
  
      const response = await request(app).put(`/cards/${card._id}`).send(updatedData);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Carta actualizada exitosamente");
      expect(response.body.updatedCard).toHaveProperty("_id", card._id.toString());
      expect(response.body.updatedCard).toHaveProperty("color", "blue");
      expect(response.body.updatedCard).toHaveProperty("value", "10");
  
      // Verificar en la base de datos que los datos fueron actualizados
      const updatedCardInDb = await Card.findById(card._id);
      expect(updatedCardInDb.color).toBe("blue");
      expect(updatedCardInDb.value).toBe("10");
    });
  
    it("Debe devolver error 404 si la carta no existe", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
  
      const response = await request(app).put(`/cards/${nonExistentId}`).send({ color: "yellow", value: "3" });
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Carta no encontrada");
    });
  
    it("Debe devolver error 400 si los datos enviados son inválidos", async () => {
      const player = new Player({ name: "Jugador1", age: 20, email: "jugador1@example.com", password: "password123" });
      await player.save();
  
      const game = new Game({ title: "Juego de prueba", status: "pending", maxPlayers: 4, creator: player._id });
      await game.save();
  
      const card = new Card({ color: "red", value: "5", playerId: player._id, gameId: game._id });
      await card.save();
  
      const invalidUpdate = { color: "", value: null }; // Datos inválidos
  
      const response = await request(app).put(`/cards/${card._id}`).send(invalidUpdate);
  
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Error en los datos de la carta");
    });
  });


  describe("DELETE /cards/:id", () => {
    let card, player, game;
  
    beforeEach(async () => {
      player = new Player({ name: "Jugador1", age: 20, email: "jugador1@example.com", password: "password123" });
      await player.save();
  
      game = new Game({ title: "Juego de prueba", status: "pending", maxPlayers: 4, creator: player._id });
      await game.save();
  
      card = new Card({ color: "red", value: "5", playerId: player._id, gameId: game._id });
      await card.save();
    });
  
    it("Debe eliminar una carta existente y devolver un status 200", async () => {
      const response = await request(app).delete(`/cards/${card._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Carta eliminada exitosamente");
  
      const deletedCard = await Card.findById(card._id);
      expect(deletedCard).toBeNull();
    });
  
    it("Debe devolver error 404 si la carta no existe", async () => {
      const nonExistentId = "64b9f3c2c3a6e8c0f4a2e1b0"; 
      const response = await request(app).delete(`/cards/${nonExistentId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Carta no encontrada");
    });
  });