import { Game } from "../../data/models/gameModel.js";
import { ValidationError, NotFoundError } from "../../utils/customErrors.js";

export const post = async (req, res, next) => {
    try {
        const { title, status, maxPlayers} = req.body;

        if (!title || !status || !maxPlayers) {
            return next(new ValidationError("Todos los campos son obligatorios"));
        }

        const newGame = new Game({
            title,
            status,
            maxPlayers,
        });

        await newGame.save();

        res.status(201).json(newGame);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const Games = await Game.find(); 

        if (!Games || Games.length === 0) {
            return next(new NotFoundError("No se encontraron juegos"));
        }

        res.status(200).json(Games);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const getGame = await Game.findById(id);

        if (!getGame) {
            return next(new NotFoundError("juego no encontrado"));
        }

        res.status(200).json(getGame);
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedGame = await Game.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedGame) {
            return next(new NotFoundError("juego no encontrado"));
        }

        res.status(200).json({ message: "juego actualizado exitosamente", updatedGame });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(new ValidationError("Error en los datos del juego"));
        }
        next(error);
    }
};

export const deleted = async (req, res, next) => {
  try {
      const { id } = req.params;
      const deleteGame = await Game.findByIdAndDelete(id);

      if (!deleteGame) {
          return next(new NotFoundError("juego no encontrado"));
      }

      res.status(200).json({ message: "juego eliminado exitosamente", deleteGame });
  } catch (error) {
      next(error);
  }
};