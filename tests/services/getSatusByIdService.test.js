import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Game } from "../../src/data/models/gameModel.js";
import { Player } from "../../src/data/models/userModel.js";

import { getSatusByIdService } from "../../src/business/services/gameService.js";
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
    await Game.deleteMany({});
});

describe("getSatusByIdService", () => {
    it("Debe obtener el estado del juego correctamente", async () => {
        const player = new Player({
            name: "Jugador1",
            age: 20,
            email: "jugador1@example.com",
            password: "password123",
        });
        await player.save();
    
        const game = new Game({
            title: "UNO",
            status: "started",
            creator: player._id.toString(),
            maxPlayers: 3,
        });
        await game.save();
    
        const response = await getSatusByIdService(game._id);
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("game_id");
        
        // Comparación segura del ObjectId
        expect(String(response.body.game_id)).toBe(String(game._id));
        expect(response.body).toHaveProperty("state", "started");
    });
    
    it("Debe devolver error 404 si el juego no existe", async () => {
        const fakeGameId = new mongoose.Types.ObjectId();

        const response = await getSatusByIdService(fakeGameId);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Juego no encontrado");
    });
});
