import winston from "winston";

const logger = winston.createLogger({
    level: "error",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "errors.log", level: "error" }), 
        new winston.transports.Console({ format: winston.format.simple() }), 
    ],
});

export default logger;
