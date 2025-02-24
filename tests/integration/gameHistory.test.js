import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js";
import { Game } from "../../src/data/models/gameModel.js";
import { Player } from "../../src/data/models/userModel.js";
import { jest } from "@jest/globals";
import { GameHistory } from "../../src/data/models/gameHistoryModel.js";

let mongoServer;

beforeAll(async () => {
    jest.setTimeout(500000);
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
}, 5000000);

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    await GameHistory.deleteMany({});
    await Game.deleteMany({});
    await Player.deleteMany({});
});

describe("GET /games/:gameId/history", () => {
    it("Debe devolver el historial de un juego existente", async () => {
        const player = new Player({ 
            name: "Jugador1", 
            age: 25, 
            email: "jugador1@example.com", 
            password: "password123" 
        });
        await player.save();

        const game = new Game({ 
            title: "Juego UNO", 
            status: "pending", 
            maxPlayers: 4, 
            creator: player._id 
        });
        await game.save();

        await GameHistory.create({ 
            gameId: game._id, 
            playerId: player._id, 
            action: "Juega carta roja 5",
            timestamp: new Date()
        });

        await GameHistory.create({ 
            gameId: game._id, 
            playerId: player._id, 
            action: "Juega carta azul 2",
            timestamp: new Date()
        });


        const response = await request(app).get(`/gameHistory/games/${game._id}/history`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("history");
    });
});
