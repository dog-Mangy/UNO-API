
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Game } from "../../src/data/models/gameModel.js";
import { Player } from "../../src/data/models/userModel.js";
import { getUserByIdService } from "../../src/business/services/gameService.js";
import { jest } from "@jest/globals";

let mongoServer;

beforeAll(async () => {
    jest.setTimeout(500000);
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
},500000);

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    await Game.deleteMany({});
    await Player.deleteMany({});
});


describe("getUserByIdService", () => {
    it("Debe obtener la lista de jugadores correctamente", async () => {
        const player1 = new Player({ name: "Jugador1",age : 22, email: "jugador1@example.com", password: "password123" });
        const player2 = new Player({ name: "Jugador2",age : 22, email: "jugador2@example.com", password: "password123" });
        await player1.save();
        await player2.save();

        const game = new Game({
            title: "UNO",
            status: "pending",
            creator: player1._id.toString(),
            maxPlayers: 4,
            players: [player1._id, player2._id],
        });
        await game.save();

        const response = await getUserByIdService(game._id);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("game_id");
        expect(response.body).toHaveProperty("players");
        expect(Array.isArray(response.body.players)).toBe(true);
        expect(response.body.players.length).toBe(2);
        expect(response.body.players).toContainEqual(player1._id);
        expect(response.body.players).toContainEqual(player2._id);
    });

    it("Debe devolver error 404 si el juego no existe", async () => {
        const invalidGameId = new mongoose.Types.ObjectId();
    
        await expect(getUserByIdService(invalidGameId))
            .rejects.toThrow("Game not found");
    });
});
