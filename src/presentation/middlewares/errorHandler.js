import logger from "../../config/logger.js";

export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Algo salió mal.";

    logger.error({
        message,
        status,
        stack: err.stack, 
        route: req.originalUrl, 
        method: req.method,
    });

    res.status(status).json({
        error: true,
        status,
        message,
    });
};
