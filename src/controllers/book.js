import { Book } from "../models/userModel.js";
import { ValidationError, NotFoundError } from "../utils/customErrors.js";

export const post = async (req, res, next) => {
    try {
        const { name, description, genre, platform } = req.body;

        if (!name || !description || !genre || !platform) {
            return next(new ValidationError("Todos los campos son obligatorios"));
        }

        const newBook = new Book({
            name,
            description,
            genre,
            platform,
        });

        await newBook.save();

        res.status(201).json(newBook);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const books = await Book.find(); 

        if (!books || books.length === 0) {
            return next(new NotFoundError("No se encontraron games"));
        }

        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);

        if (!book) {
            return next(new NotFoundError("Game no encontrado"));
        }

        res.status(200).json(book);
    } catch (error) {
        next(error);
    }
};

export const deleteGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await Book.findByIdAndDelete(id);

        if (!book) {
            return next(new NotFoundError("Libro no encontrado"));
        }

        res.status(200).json({ message: "Libro eliminado exitosamente", book });
    } catch (error) {
        next(error);
    }
};

export const updateGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const book = await Book.findByIdAndUpdate(id, updates, { new: true });

        if (!book) {
            return next(new NotFoundError("Libro no encontrado"));
        }

        res.status(200).json({ message: "Libro actualizado exitosamente", book });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(new ValidationError("Error en los datos del libro"));
        }
        next(error);
    }
};
