import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateUser = (token) => {
    if (!token) {
        return handleError(400, "Falta el token de autenticación");
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded || !decoded.id) {
            return handleError(400, "Token inválido o sin ID de usuario");
        }
        return { status: 200, userId: decoded.id };
    } catch (err) {
        return handleError(401, "Token inválido o expirado");
    }
};
