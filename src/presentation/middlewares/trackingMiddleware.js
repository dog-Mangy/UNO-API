import { Tracking } from "../../data/models/trakingModel.js";

export const trackingMiddleware = async (req, res, next) => {
    const start = Date.now(); 

    res.on("finish", async () => {
        const responseTime = Date.now() - start; 

        const trackingData = {
            endpointAccess: req.originalUrl,
            requestMethod: req.method,
            statusCode: res.statusCode,
            timestamp: new Date().toISOString(),
            responseTime,
            userId: req.user ? req.user.id : null, 
        };

        try {
            await Tracking.findOneAndUpdate(
                { endpointAccess: trackingData.endpointAccess, requestMethod: trackingData.requestMethod },
                { 
                    $inc: { requestCount: 1 },
                    $set: { statusCode: trackingData.statusCode, timestamp: trackingData.timestamp },
                    $push: { responseTimes: trackingData.responseTime }
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error("Error guardando seguimiento:", error);
        }
    });

    next();
};