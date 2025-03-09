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

describe("PUT /cards/play", () => {
    let player, game, topCard, playedCard, invalidCard;

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

        topCard = new Card({
            gameId: game._id,
            playerId: null,
            color: "red",
            value: "5",
            discarded: true
        });
        await topCard.save();

        playedCard = new Card({
            gameId: game._id,
            playerId: player._id,
            color: "red",
            value: "7",
            discarded: false
        });
        await playedCard.save();

        invalidCard = new Card({
            gameId: game._id,
            playerId: player._id,
            color: "blue",
            value: "9",
            discarded: false
        });
        await invalidCard.save();
    });

    it("Debe permitir jugar una carta válida y ganar el juego", async () => {
        const token = jwt.sign(
            { id: player._id.toString(), email: player.email },
            process.env.SECRET_KEY || "claveSuperSecreta",
            { expiresIn: "1h" }
        );
    
        const response = await request(app)
            .put("/cards/play")
            .set("Authorization", `Bearer ${token}`) 
            .send({ cardId: playedCard._id.toString(), gameId: game._id.toString() });
    
        console.log("Respuesta recibida:", response.body);
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Card played successfully.");
    });
});
