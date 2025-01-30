import UserService from "../../business/services/userService.js";
import { Player } from "../../data/models/userModel.js";
import { ValidationError, NotFoundError } from "../../utils/customErrors.js";

export const post = async (req, res, next) => {
    try {
      const { name, age, email, password } = req.body;
  
      if (!name || !age || !email || !password) {
        return next(new ValidationError("Todos los campos son obligatorios"));
      }
  
      const result = await UserService.registerUser({ name, age, email, password });
  
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

export const getAll = async (req, res, next) => {
    try {
        const Players = await Player.find(); 

        if (!Players || Players.length === 0) {
            return next(new NotFoundError("No se encontraron jugadores"));
        }

        res.status(200).json(Players);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const getPlayer = await Player.findById(id);

        if (!getPlayer) {
            return next(new NotFoundError("jugador no encontrado"));
        }

        res.status(200).json(getPlayer);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedPlayer = await Player.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedPlayer) {
            return next(new NotFoundError("Jugador no encontrado"));
        }

        res.status(200).json({ message: "Jugador actualizado exitosamente", updatedPlayer });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(new ValidationError("Error en los datos del usuario"));
        }
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
  try {
      const { id } = req.params;
      const deletePlayer = await Player.findByIdAndDelete(id);

      if (!deletePlayer) {
          return next(new NotFoundError("juagdor no encontrado"));
      }

      res.status(200).json({ message: "jugador eliminado exitosamente", deletePlayer });
  } catch (error) {
      next(error);
  }
};