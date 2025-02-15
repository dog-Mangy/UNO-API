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

class ConflictError extends CustomError {
    constructor(message) {
        super(409, message || "Conflicto en la solicitud");
    }
}

class MethodNotAllowedError extends CustomError {
    constructor(message) {
        super(405, message || "Método no permitido");
    }
}


export { CustomError, ValidationError, NotFoundError, UnauthorizedError, ConflictError, MethodNotAllowedError };
