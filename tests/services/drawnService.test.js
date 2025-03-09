import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../src/app.js";
import { Game } from "../../src/data/models/gameModel.js";
import { Player } from "../../src/data/models/userModel.js";
import { Card } from "../../src/data/models/cardModel.js";
import { jest } from "@jest/globals";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

let mongoServer;

beforeAll(async () => {
    jest.setTimeout(1000000);
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}, 1000000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("PUT /cards/draw", () => {
    let player, game, deckCard;

    beforeEach(async () => {
        await Game.deleteMany({});
        await Player.deleteMany({});
        await Card.deleteMany({});

        player = new Player({
            name: "Jugador1",
            email: "jugador1@example.com",
            age: 20,
            password: "password123"
        });
        await player.save();

        game = new Game({
            title: "UNO Game",
            status: "started",
            maxPlayers: 4,
            players: [player._id],
            turnIndex: 0,
            creator: player._id
        });
        await game.save();

        deckCard = new Card({
            gameId: game._id,
            playerId: null,
            color: "green",
            value: "2",
            discarded: false
        });
        await deckCard.save();
    });

    function generateToken(user) {
        return jwt.sign(
            { id: user._id.toString(), email: user.email },
            process.env.SECRET_KEY || "claveSuperSecreta",
            { expiresIn: "1h" }
        );
    }

    it("Debe permitir robar una carta del mazo", async () => {
        const token = generateToken(player);

        const response = await request(app)
            .put("/cards/draw")
            .set("Authorization", `Bearer ${token}`)
            .send({ gameId: game._id.toString() });

        console.log("Respuesta recibida:", response.body);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Card drawn. Next player's turn.");
        expect(response.body).toHaveProperty("drawnCard");
    });

    it("Debe devolver un error 404 si el juego no existe", async () => {
        const fakeGameId = new mongoose.Types.ObjectId().toString();
        const token = generateToken(player);

        const response = await request(app)
            .put("/cards/draw")
            .set("Authorization", `Bearer ${token}`)
            .send({ gameId: fakeGameId });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Game not found");
    });

    it("Debe devolver un error si no es el turno del jugador", async () => {
        const otherPlayer = new Player({
            name: "Jugador2",
            email: "jugador2@example.com",
            age: 22,
            password: "password456"
        });
        await otherPlayer.save();

        game.players.push(otherPlayer._id);
        game.markModified("players"); // Asegurar que Mongoose lo reconozca
        game.turnIndex = 1; // No es el turno de `player`
        await game.save();

        const token = generateToken(player);

        const response = await request(app)
            .put("/cards/draw")
            .set("Authorization", `Bearer ${token}`)
            .send({ gameId: game._id.toString() });

        console.log("Respuesta recibida:", response.body);

        expect(response.status).toBe(405);
        expect(response.body).toHaveProperty("message", "It's not your turn.");
    });
});
