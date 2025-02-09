import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Game } from "../../src/data/models/gameModel.js";
import { Player } from "../../src/data/models/userModel.js";
import { PlayerGameState } from "../../src/data/models/playerGameState.js";
import { jest } from "@jest/globals";
import { startGameService } from "../../src/business/services/gameService.js";

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
    await PlayerGameState.deleteMany({});
});

describe("startGameService", () => {
    it("Debe iniciar el juego si todos los jugadores están listos", async () => {
        const creator = new Player({ name: "Creador", age: 30, email: "creador@example.com", password: "password" });
        await creator.save();

        const game = new Game({ title: "UNO", status: "pending", maxPlayers: 4, creator: creator._id });
        await game.save();

        // Agregar jugadores al juego
        const player1 = new Player({ name: "Jugador 1", age:22, email: "player1@example.com", password: "password" });
        const player2 = new Player({ name: "Jugador 2", age:23, email: "player2@example.com", password: "password" });
        await player1.save();
        await player2.save();

        // Estado de jugadores (todos listos)
        await PlayerGameState.create([
            { user: player1._id, game: game._id, ready: true },
            { user: player2._id, game: game._id, ready: true }
        ]);

        // Generar token del creador
        const token = jwt.sign({ id: creator._id.toString(), email: creator.email }, process.env.SECRET_KEY);

        // Llamar al servicio
        const response = await startGameService(game._id, token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Juego iniciado correctamente");

        // Verificar que el estado del juego cambió a "started"
        const updatedGame = await Game.findById(game._id);
        expect(updatedGame.status).toBe("started");
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

        const response = await startGameService(game._id, token);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "No todos los jugadores están listos");
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

        const response = await startGameService(game._id, token);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "No tienes permisos para iniciar este juego");
    });

    it("Debe devolver error 404 si el juego no existe", async () => {
        const creator = new Player({ name: "Creador", age:22, email: "creador@example.com", password: "password" });
        await creator.save();

        const fakeGameId = new mongoose.Types.ObjectId();

        const token = jwt.sign({ id: creator._id.toString(), email: creator.email }, process.env.SECRET_KEY);

        const response = await startGameService(fakeGameId, token);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Juego no encontrado");
    });

    it("Debe devolver error 400 si faltan parámetros", async () => {
        const response = await startGameService(null, null);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Faltan parámetros obligatorios");
    });
});
