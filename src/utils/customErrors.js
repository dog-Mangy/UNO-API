// utils/customErrors.js
class CustomError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends CustomError {
    constructor(message) {
        super(400, message || "Error de validación");
    }
}

class NotFoundError extends CustomError {
    constructor(message) {
        super(404, message || "Recurso no encontrado");
    }
}

class UnauthorizedError extends CustomError {
    constructor(message) {
        super(401, message || "No autorizado");
    }
}

export { CustomError, ValidationError, NotFoundError, UnauthorizedError };
