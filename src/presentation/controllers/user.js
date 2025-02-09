import UserService from "../../business/services/userService.js";
import { NotFoundError, ValidationError } from "../../utils/customErrors.js";

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
        const players = await UserService.getAllUsers(); 

        if (!players || players.length === 0) {
            return next(new NotFoundError("No se encontraron jugadores"));
        }

        res.status(200).json(players);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const player = await UserService.getUserById(id);

        if (!player) {
            return next(new NotFoundError("Jugador no encontrado"));
        }

        res.status(200).json(player);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedPlayer = await UserService.updateUser(id, updates);

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
        const result = await UserService.deleteUser(id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
