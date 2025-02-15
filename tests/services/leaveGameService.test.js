import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Game } from "../../src/data/models/gameModel.js";
import { Player } from "../../src/data/models/userModel.js";
import { PlayerGameState } from "../../src/data/models/playerGameState.js";
import { leaveGameService } from "../../src/business/services/gameService.js";
import { jest } from "@jest/globals";

dotenv.config();

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
    await Player.deleteMany({});
    await PlayerGameState.deleteMany({});
});

describe("leaveGameService", () => {
    it("Debe permitir que el jugador abandone el juego correctamente", async () => {
        const player = new Player({ name: "Jugador1", age: 22, email: "jugador1@example.com", password: "password" });
        await player.save();

        const player2 = new Player({ name: "Jugador2", age: 22, email: "jugador2@example.com", password: "password" });
        await player2.save();  

        const game = new Game({ title: "UNO", status: "started", maxPlayers: 4, creator: player._id, players: [player2._id] });
        await game.save();

        await PlayerGameState.create({ user: player._id, game: game._id, ready: true });

        const token = jwt.sign({ id: player2._id.toString(), email: player2.email }, process.env.SECRET_KEY);

        const response = await leaveGameService(game._id, player2._id);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "User successfully left the game");

        const updatedGame = await Game.findById(game._id);
        expect(updatedGame.players).not.toContain(player2._id);  
    });

    it("Debe devolver error 400 si el jugador no está en el juego", async () => {
        const player = new Player({ name: "Jugador1", age: 22, email: "jugador1@example.com", password: "password" });
        await player.save();

        const game = new Game({ title: "UNO", status: "started", maxPlayers: 4, creator: player._id, players: [] });
        await game.save();

        await expect(leaveGameService(game._id, player._id))
            .rejects.toThrow("You are not in this game"); 
    });

    it("Debe devolver error 404 si el juego no existe", async () => {
        const player = new Player({ name: "Jugador1", age: 22, email: "jugador1@example.com", password: "password" });
        await player.save();

        const fakeGameId = new mongoose.Types.ObjectId();

        await expect(leaveGameService(fakeGameId, player._id))
            .rejects.toThrow("Game not found");  
    });

    it("Debe devolver error 400 si faltan parámetros", async () => {
        await expect(leaveGameService(null, null))
            .rejects.toThrow("Missing required parameters");  
    });
});
