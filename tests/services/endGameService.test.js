import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Game } from "../../src/data/models/gameModel.js";
import { Player } from "../../src/data/models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { endGameService } from "../../src/business/services/gameService.js";
import { jest } from "@jest/globals";


dotenv.config();

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

describe("endGameService", () => {
    it("Debe permitir que el creador finalice el juego correctamente", async () => {
        const creator = new Player({ name: "Creador", age: 22, email: "creador@example.com", password: "password" });
        await creator.save();

        const game = new Game({ title: "UNO", status: "started", maxPlayers: 4, creator: creator._id });
        await game.save();

        const token = jwt.sign({ id: creator._id.toString(), email: creator.email }, process.env.SECRET_KEY);

        const response = await endGameService(game._id, token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Game ended successfully");

        const updatedGame = await Game.findById(game._id);
        expect(updatedGame.status).toBe("finished");
    });

    it("Debe devolver error 403 si un usuario que no es el creador intenta finalizar el juego", async () => {
        const creator = new Player({ name: "Creador", age: 22, email: "creador@example.com", password: "password" });
        const otherUser = new Player({ name: "Jugador", age: 22, email: "jugador@example.com", password: "password" });

        await creator.save();
        await otherUser.save();

        const game = new Game({ title: "UNO", status: "started", maxPlayers: 4, creator: creator._id });
        await game.save();

        const token = jwt.sign({ id: otherUser._id.toString(), email: otherUser.email }, process.env.SECRET_KEY);

        await expect(endGameService(game._id, token))
            .rejects.toThrow("You do not have permission to end this game");
    });

    it("Debe devolver error 404 si el juego no existe", async () => {
        const creator = new Player({ name: "Creador", age: 22, email: "creador@example.com", password: "password" });
        await creator.save();

        const fakeGameId = new mongoose.Types.ObjectId();
        const token = jwt.sign({ id: creator._id.toString(), email: creator.email }, process.env.SECRET_KEY);

        await expect(endGameService(fakeGameId, token))
            .rejects.toThrow("Game not found");
    });

    it("Debe devolver error 400 si el juego ya está finalizado", async () => {
        const creator = new Player({ name: "Creador", age: 22, email: "creador@example.com", password: "password" });
        await creator.save();

        const game = new Game({ title: "UNO", status: "finished", maxPlayers: 4, creator: creator._id });
        await game.save();

        const token = jwt.sign({ id: creator._id.toString(), email: creator.email }, process.env.SECRET_KEY);

        await expect(endGameService(game._id, token))
            .rejects.toThrow("The game is not in progress");
    });

    it("Debe devolver error 400 si faltan parámetros", async () => {
        await expect(endGameService(null, null))
            .rejects.toThrow("Missing required parameters");
    });
});
