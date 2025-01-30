import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { tokenBlacklist } from "../controllers/auth.js";

dotenv.config();

export const authenticateJWT = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado: No hay token" });
    }

    // 🔴 Verificar si el token está en la lista negra
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token no válido" });
    }
};
