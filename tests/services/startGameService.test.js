import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Game } from "../../src/data/models/gameModel.js";
import { Player } from "../../src/data/models/userModel.js";
import { PlayerGameState } from "../../src/data/models/playerGameState.js";
import { jest } from "@jest/globals";
import { Card } from "../../src/data/models/cardModel.js";
import { startGameService } from "../../src/business/services/game/StartGameService.js";

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

describe("startGameService", () => {
    it("Debe iniciar el juego si todos los jugadores están listos", async () => {
        const creator = new Player({ name: "Creador", age: 30, email: "creador@example.com", password: "password" });
        await creator.save();

        const game = new Game({ title: "UNO", status: "pending", maxPlayers: 4, creator: creator._id });
        await game.save();

        const player1 = new Player({ name: "Jugador 1", age: 22, email: "player1@example.com", password: "password" });
        const player2 = new Player({ name: "Jugador 2", age: 23, email: "player2@example.com", password: "password" });
        await player1.save();
        await player2.save();

        await PlayerGameState.create([
            { user: player1._id, game: game._id, ready: true },
            { user: player2._id, game: game._id, ready: true }
        ]);

        const colors = ["red", "blue", "green", "yellow"];
        const values = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        const deck = [];

        for (let i = 0; i < 14; i++) { 
            deck.push({
                color: colors[i % colors.length],
                value: values[i % values.length],
                playerId: null, 
                gameId: game._id
            });
        }

        await Card.insertMany(deck);

        const token = jwt.sign({ id: creator._id.toString(), email: creator.email }, process.env.SECRET_KEY);

        const response = await startGameService(game._id, token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Game started successfully");

        const updatedGame = await Game.findById(game._id);
        expect(updatedGame.status).toBe("started");

        const assignedCards = await Card.find({ gameId: game._id, playerId: { $ne: null } });
        expect(assignedCards.length).toBe(4);
    });

    it("Debe devolver error 400 si no todos los jugadores están listos", async () => {
        const creator = new Player({ name: "Creador", age: 33, email: "creador@example.com", password: "password" });
        await creator.save();

        const game = new Game({ title: "UNO", status: "pending", maxPlayers: 4, creator: creator._id });
        await game.save();

        const player1 = new Player({ name: "Jugador 1", age: 33, email: "player1@example.com", password: "password" });
        await player1.save();

        await PlayerGameState.create([{ user: player1._id, game: game._id, ready: false }]);

        const token = jwt.sign({ id: creator._id.toString(), email: creator.email }, process.env.SECRET_KEY);

        await expect(startGameService(game._id, token))
            .rejects.toThrow("Not all players are ready"); 
    });

    it("Debe devolver error 403 si un usuario no creador intenta iniciar el juego", async () => {
        const creator = new Player({ name: "Creador", age: 55, email: "creador@example.com", password: "password" });
        await creator.save();

        const game = new Game({ title: "UNO", status: "pending", maxPlayers: 4, creator: creator._id });
        await game.save();

        const player1 = new Player({ name: "Jugador 1", age: 33, email: "player1@example.com", password: "password" });
        await player1.save();

        await PlayerGameState.create([{ user: player1._id, game: game._id, ready: true }]);

        const token = jwt.sign({ id: player1._id.toString(), email: player1.email }, process.env.SECRET_KEY);

        await expect(startGameService(game._id, token))
            .rejects.toThrow("You do not have permission to start this game");
    });

    it("Debe devolver error 404 si el juego no existe", async () => {
        const creator = new Player({ name: "Creador", age: 22, email: "creador@example.com", password: "password" });
        await creator.save();

        const fakeGameId = new mongoose.Types.ObjectId();

        const token = jwt.sign({ id: creator._id.toString(), email: creator.email }, process.env.SECRET_KEY);

        await expect(startGameService(fakeGameId, token))
            .rejects.toThrow("Game not found"); 
    });

    it("Debe devolver error 400 si faltan parámetros", async () => {
        await expect(startGameService(null, null))
            .rejects.toThrow("Missing required parameters");  
    });
});
