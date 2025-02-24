import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js";
import { Player } from "../../src/data/models/userModel.js";
import { Game } from "../../src/data/models/gameModel.js";
import { jest } from "@jest/globals";


let mongoServer;

beforeAll(async () => {
  jest.setTimeout(500000); 
    
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
},5000000 );

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

describe("POST /games", () => {
  it("Debe crear un juego correctamente", async () => {
    const player = new Player({
      name: "Jugador1",
      age: 20,
      email: "jugador1@example.com",
      password: "password123",
    });

    await player.save(); 

    const newGame = {
      title: "Juego de prueba",
      status: "pending",
      maxPlayers: 4,
      creator: player._id.toString(), 
    };

    const response = await request(app).post("/games").send(newGame);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("title", "Juego de prueba");
    expect(response.body).toHaveProperty("status", "pending");
    expect(response.body).toHaveProperty("maxPlayers", 4);
    expect(response.body).toHaveProperty("creator", player._id.toString());

    const gameInDb = await Game.findById(response.body._id);
    expect(gameInDb).not.toBeNull();
  });

  it("Debe devolver un error 400 si faltan campos obligatorios", async () => {
    const response = await request(app).post("/games").send({ title: "Juego incompleto" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "All fields are required");
  });

  it("Debe devolver un error 404 si el creador del juego no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId(); 

    const newGame = {
      title: "Juego sin creador",
      status: "pendiente",
      maxPlayers: 4,
      creator: fakeId.toString(), 
    };

    const response = await request(app).post("/games").send(newGame);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Player not found");
  });
});


describe("GET /games", () => {
  
    it("Debe devolver una lista vacía si no hay juegos", async () => {
      const response = await request(app).get("/games");
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "No games found");
    });
  
    it("Debe devolver una lista de juegos si existen en la base de datos", async () => {
      const game1 = new Game({ title: "Juego1", status: "pending", maxPlayers: 4, creator: new mongoose.Types.ObjectId() });
      const game2 = new Game({ title: "Juego2", status: "pending", maxPlayers: 6, creator: new mongoose.Types.ObjectId() });
  
      await Game.insertMany([game1, game2]);
  
      const response = await request(app).get("/games");
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("title", "Juego1");
      expect(response.body[1]).toHaveProperty("title", "Juego2");
    });
});


describe("GET /games/:id", () => {
  
    it("Debe devolver un error 404 si el juego no existe", async () => {
      const fakeId = new mongoose.Types.ObjectId(); 
  
      const response = await request(app).get(`/games/${fakeId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Game not found");
    });

    it("Debe devolver un juego si el ID existe", async () => {
        const game = new Game({ 
          title: "Juego de prueba", 
          status: "pending", 
          maxPlayers: 4, 
          creator: new mongoose.Types.ObjectId() 
        });
      
        await game.save();
            
        const response = await request(app).get(`/games/${game._id}`);
      
      
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("title", "Juego de prueba");
        expect(response.body).toHaveProperty("status", "pending");
        expect(response.body).toHaveProperty("maxPlayers", 4);
      });
      
  });


  describe("PUT /games/:id", () => {
    it("Debe actualizar un juego existente", async () => {
      const game = new Game({ 
        title: "Juego Original", 
        status: "pending", 
        maxPlayers: 4, 
        creator: new mongoose.Types.ObjectId() 
      });
  
      await game.save();
  
      const updates = {
        title: "Juego Actualizado",
        status: "active",
        maxPlayers: 6
      };
  
      const response = await request(app).put(`/games/${game._id}`).send(updates);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Game updated successfully");
      expect(response.body.updatedGame).toHaveProperty("title", "Juego Actualizado");
      expect(response.body.updatedGame).toHaveProperty("status", "active");
      expect(response.body.updatedGame).toHaveProperty("maxPlayers", 6);
  
      const updatedGame = await Game.findById(game._id);
      expect(updatedGame).not.toBeNull();
      expect(updatedGame.title).toBe("Juego Actualizado");
      expect(updatedGame.status).toBe("active");
      expect(updatedGame.maxPlayers).toBe(6);
    });
  
    it("Debe devolver error 404 si el juego no existe", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updates = { title: "Nuevo Título" };
  
      const response = await request(app).put(`/games/${fakeId}`).send(updates);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Game not found");
    });
  });


  describe("DELETE /games/:id", () => {
    it("Debe eliminar un juego existente", async () => {
      const game = new Game({ 
        title: "Juego a eliminar", 
        status: "pending", 
        maxPlayers: 4, 
        creator: new mongoose.Types.ObjectId() 
      });
  
      await game.save();
  
      const response = await request(app).delete(`/games/${game._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Game deleted successfully");
  
      const gameInDb = await Game.findById(game._id);
      expect(gameInDb).toBeNull();
    });
  
    it("Debe devolver error 404 si el juego no existe", async () => {
      const fakeId = new mongoose.Types.ObjectId();
  
      const response = await request(app).delete(`/games/${fakeId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Game not found");
    });
  });