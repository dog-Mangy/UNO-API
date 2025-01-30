import UserService from "../../business/services/userService.js";
import jwt from "jsonwebtoken";
import { ValidationError, NotFoundError } from "../../utils/customErrors.js";
import dotenv from "dotenv";

dotenv.config();

const KEY = process.env.SECRET_KEY;

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("El correo y la contraseña son obligatorios"));
    }

    const user = await UserService.authenticateUser({ email, password });

    if (!user) {
      return next(new NotFoundError("Credenciales inválidas"));
    }

    const token = jwt.sign({ id: user.id, email: user.email }, KEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    next(error);
  }
};

export const tokenBlacklist = new Set();

export const logout = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Token requerido" });
    }

    try {
      jwt.verify(token, process.env.SECRET_KEY);
      tokenBlacklist.add(token);
      res.status(200).json({ message: "Cierre de sesión exitoso" });
      console.log(tokenBlacklist)
    } catch (error) {
      return res.status(403).json({ message: "Token no válido" });
    }
  } catch (error) {
    next(error);
  }
};
