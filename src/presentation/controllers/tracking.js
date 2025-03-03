import { Tracking } from "../../data/models/trakingModel.js";

// 1️⃣ Total de solicitudes por endpoint y método
export const getRequestStats = async (req, res) => {
    try {
        const stats = await Tracking.aggregate([
            {
                $group: {
                    _id: { endpoint: "$endpointAccess", method: "$requestMethod" },
                    count: { $sum: "$requestCount" }
                }
            }
        ]);

        let breakdown = {};
        let totalRequests = 0;

        stats.forEach(({ _id, count }) => {
            if (!breakdown[_id.endpoint]) {
                breakdown[_id.endpoint] = {};
            }
            breakdown[_id.endpoint][_id.method] = count;
            totalRequests += count;
        });

        res.json({ total_requests: totalRequests, breakdown });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
};

// 2️⃣ Tiempos de respuesta promedio, mínimo y máximo
export const getResponseTimes = async (req, res) => {
    try {
        const stats = await Tracking.aggregate([
            {
                $project: {
                    endpointAccess: 1,
                    avgTime: { $avg: "$responseTimes" },
                    minTime: { $min: "$responseTimes" },
                    maxTime: { $max: "$responseTimes" }
                }
            }
        ]);

        let responseTimes = {};
        stats.forEach(({ endpointAccess, avgTime, minTime, maxTime }) => {
            responseTimes[endpointAccess] = { avg: avgTime, min: minTime, max: maxTime };
        });

        res.json(responseTimes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener tiempos de respuesta" });
    }
};

// 3️⃣ Códigos de estado más comunes
export const getStatusCodes = async (req, res) => {
    try {
        const stats = await Tracking.aggregate([
            {
                $group: {
                    _id: "$statusCode",
                    count: { $sum: "$requestCount" }
                }
            }
        ]);

        let statusCodes = {};
        stats.forEach(({ _id, count }) => {
            statusCodes[_id] = count;
        });

        res.json(statusCodes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener códigos de estado" });
    }
};

// 4️⃣ Endpoints más populares
export const getPopularEndpoints = async (req, res) => {
    try {
        const mostPopular = await Tracking.findOne().sort({ requestCount: -1 }).limit(1);

        if (!mostPopular) {
            return res.json({ most_popular: null, request_count: 0 });
        }

        res.json({ most_popular: mostPopular.endpointAccess, request_count: mostPopular.requestCount });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener endpoint más popular" });
    }
};


