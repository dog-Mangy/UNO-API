import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js"; 
import { Player } from "../../src/data/models/userModel.js";
import { jest } from "@jest/globals";


let mongoServer;

beforeAll(async () => {
  jest.setTimeout(500000); 
  
  mongoServer = await MongoMemoryServer.create({
    binary: {
      skipMD5: true, 
    },
    instance: {
      port: 27017, 
    },
  });

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
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

describe("POST /users/register", () => {
  it("Debe registrar un usuario correctamente", async () => {
    const newUser = {
      name: "TestUser",
      age: 25,
      email: "test@example.com",
      password: "password123",
    };

    const response = await request(app).post("/users").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "User registered successfully");
    expect(response.body.user).toHaveProperty("name", "TestUser");
    expect(response.body.user).toHaveProperty("email", "test@example.com");
  });
});

describe("GET /users", () => {
  it("Debe devolver una lista vacía si no hay jugadores", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "No players found");
  });

  it("Debe devolver una lista de jugadores si existen en la base de datos", async () => {
    const player1 = new Player({ name: "Jugador1", age: 20, email: "jugador1@example.com", password: "fliateamo" });
    const player2 = new Player({ name: "Jugador2", age: 22, email: "jugador2@example.com", password: "fliateamo" });

    await Player.insertMany([player1, player2]);

    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty("name", "Jugador1");
    expect(response.body[1]).toHaveProperty("name", "Jugador2");
  });
});


describe("GET /users/:id", () => {

  it("Debe devolver un error 404 si el jugador no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/users/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
        error: true,
        status: 404,
        message: "User not found"
    });
});


  it("Debe devolver un jugador si el ID existe", async () => {
    const player = new Player({ 
      name: "Jugador1", 
      age: 20, 
      email: "jugador1@example.com", 
      password: "fliateamo" 
    });

    await player.save(); 

    const response = await request(app).get(`/users/${player._id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "Jugador1");
    expect(response.body).toHaveProperty("email", "jugador1@example.com");
  });
});


describe("PUT /users/:id", () => {
  it("Debe actualizar un usuario correctamente", async () => {
    const player = new Player({ 
      name: "Jugador1", 
      age: 20, 
      email: "jugador1@example.com", 
      password: "fliateamo" 
    });

    await player.save();

    const updates = {
      name: "JugadorActualizado",
      age: 25,
    };

    const response = await request(app).put(`/users/${player._id}`).send(updates);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Player successfully updated");
    expect(response.body.updatedUser).toHaveProperty("name", "JugadorActualizado");
    expect(response.body.updatedUser).toHaveProperty("age", 25);
  });

  it("Debe devolver un error 404 si el jugador no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app).put(`/users/${fakeId}`).send({ name: "NuevoNombre" });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: true,
      status: 404,
      message: "Player not found"
    });
  });
});

describe("DELETE /users/:id", () => {
  it("Debe eliminar un usuario correctamente", async () => {
    const player = new Player({ 
      name: "Jugador1", 
      age: 20, 
      email: "jugador1@example.com", 
      password: "fliateamo" 
    });

    await player.save();

    const response = await request(app).delete(`/users/${player._id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Player successfully eliminated");
    expect(response.body.deletedUser).toHaveProperty("_id", player._id.toString());

    const deletedPlayer = await Player.findById(player._id);
    expect(deletedPlayer).toBeNull();
  });

  it("Debe devolver un error 404 si el usuario no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId(); 

    const response = await request(app).delete(`/users/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: true,
      status: 404,
      message: "Player not found"
    });
  });
});

