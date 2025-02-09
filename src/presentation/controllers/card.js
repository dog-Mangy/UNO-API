import { CardService } from "../../business/services/cardService.js";

export const post = async (req, res, next) => {
    try {
        const newCard = await CardService.createCard(req.body);
        res.status(201).json(newCard);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const cards = await CardService.getAllCards();
        res.status(200).json(cards);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const card = await CardService.getCardById(req.params.id);
        res.status(200).json(card);
    } catch (error) {
        next(error);
    }
};

export const getTopDiscardCard = async (req, res, next) => {
    try {
        const topCard = await CardService.getTopDiscardCard(req.body.game_id);
        res.status(200).json(topCard);
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const updatedCard = await CardService.updateCard(req.params.id, req.body);
        res.status(200).json(updatedCard);
    } catch (error) {
        next(error);
    }
};

export const deleted = async (req, res, next) => {
    try {
        const deletedCard = await CardService.deleteCard(req.params.id);
        res.status(200).json(deletedCard);
    } catch (error) {
        next(error);
    }
};
