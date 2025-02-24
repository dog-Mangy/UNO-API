import { CardCreationService } from "../../business/services/card/CardCreationService.js";
import { CardDeletionService } from "../../business/services/card/CardDeletionService.js";
import { CardGameService } from "../../business/services/card/CardGameService.js";
import { CardRetrievalService } from "../../business/services/card/CardRetrievalService.js";
import { CardService } from "../../business/services/card/CardService.js";
import { CardUpdateService } from "../../business/services/card/CardUpdateService.js";


export const post = async (req, res, next) => {
    try {
        const card = await CardCreationService.createCard(req.body);
        res.status(201).json(card);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const cards = await CardRetrievalService.getAllCards();
        res.status(200).json(cards);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const card = await CardRetrievalService.getCardById(req.params.id);
        res.status(200).json(card);
    } catch (error) {
        next(error);
    }
};

export const getTopDiscardCard = async (req, res, next) => {
    try {
        const topCard = await CardGameService.getTopDiscardCard(req.body.gameId);
        res.status(200).json(topCard);
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const updatedCard = await CardUpdateService.updateCard(req.params.id, req.body);
        res.status(200).json(updatedCard);
    } catch (error) {
        next(error);
    }
};

export const deleted = async (req, res, next) => {
    try {
        const result = await CardDeletionService.deleteCard(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const playCard = async (req, res, next) => {
    try {
        const { userId, cardId, gameId } = req.body;

        const result = await CardService.playCard(userId, gameId, cardId);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


export const drawnCard = async (req, res, next) => {
    try {
        const { gameId, userId } = req.body; 

        if (!userId) {
            return res.status(400).json({ message: "userId es requerido" });
        }

        const result = await CardService.drawCard(userId, gameId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const declareUno = async (req, res, next) => {
    try {
        const { gameId, userId } = req.body; 

        if (!userId) {
            return res.status(400).json({ message: "userId es requerido" });
        }

        const result = await CardService.declareUno(userId, gameId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const challengeUno = async (req, res, next) => {
    try {
        const { gameId, challengerId, challengedPlayerId } = req.body;

        if (!challengerId || !challengedPlayerId) {
            return res.status(400).json({ message: "challengerId y challengedPlayerId son requeridos." });
        }

        const result = await CardService.challengeUno(challengerId, challengedPlayerId, gameId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getPlayerHand = async (req, res, next) => {
    try {
        const { playerId } = req.params; 

        if (!playerId) {
            return res.status(400).json({ message: "playerId es requerido." });
        }

        const hand = await CardService.getPlayerHand(playerId);

        return res.status(200).json(hand);
    } catch (error) {
        next(error); 
    }
};

