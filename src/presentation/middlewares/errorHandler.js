export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Algo salió mal.";

    console.error(`[Error ${status}] ${message}`);
    
    res.status(status).json({
        error: true,
        status,
        message,
    });
};
