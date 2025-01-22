import { Card } from "../../data/models/cardModel.js";
import { ValidationError, NotFoundError } from "../../utils/customErrors.js";

export const post = async (req, res, next) => {
    try {
        const { color, value, gameId} = req.body;

        if (!color || !value || !gameId) {
            return next(new ValidationError("Todos los campos son obligatorios"));
        }

        const newCard = new Card({
            color,
            value,
            gameId,
        });

        await newCard.save();

        res.status(201).json(newCard);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const Cards = await Card.find(); 

        if (!Cards || Cards.length === 0) {
            return next(new NotFoundError("No se encontraron cartas"));
        }

        res.status(200).json(Cards);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const getCard = await Card.findById(id);

        if (!getCard) {
            return next(new NotFoundError("carta no encontrada"));
        }

        res.status(200).json(getCard);
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedCard = await Card.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedCard) {
            return next(new NotFoundError("carta no encontrado"));
        }

        res.status(200).json({ message: "carta actualizado exitosamente", updatedCard });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(new ValidationError("Error en los datos de la carta"));
        }
        next(error);
    }
};

export const deleted = async (req, res, next) => {
  try {
      const { id } = req.params;
      const deleteCard = await Card.findByIdAndDelete(id);

      if (!deleteCard) {
          return next(new NotFoundError("carta no encontrado"));
      }

      res.status(200).json({ message: "carta eliminado exitosamente", deleteCard });
  } catch (error) {
      next(error);
  }
};