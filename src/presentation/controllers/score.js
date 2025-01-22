import { Score } from "../../data/models/scoreModel.js";
import { ValidationError, NotFoundError } from "../../utils/customErrors.js";

export const post = async (req, res, next) => {
    try {
        const { playerId, gameId, score} = req.body;

        if (!playerId || !gameId || !score) {
            return next(new ValidationError("Todos los campos son obligatorios"));
        }

        const newScore = new Score({
            playerId,
            gameId,
            score,
        });

        await newScore.save();

        res.status(201).json(newScore);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const Scores = await Score.find(); 

        if (!Scores || Scores.length === 0) {
            return next(new NotFoundError("No se encontraron cartas"));
        }

        res.status(200).json(Scores);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const getScore = await Score.findById(id);

        if (!getScore) {
            return next(new NotFoundError("carta no encontrada"));
        }

        res.status(200).json(getScore);
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedScore = await Score.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedScore) {
            return next(new NotFoundError("carta no encontrado"));
        }

        res.status(200).json({ message: "carta actualizado exitosamente", updatedScore });
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
      const deleteScore = await Score.findByIdAndDelete(id);

      if (!deleteScore) {
          return next(new NotFoundError("carta no encontrado"));
      }

      res.status(200).json({ message: "carta eliminado exitosamente", deleteScore });
  } catch (error) {
      next(error);
  }
};