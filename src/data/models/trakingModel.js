import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema({
    endpointAccess: { type: String, required: true },
    requestMethod: { type: String, required: true },
    statusCode: { type: Number, required: true },
    requestCount: { type: Number, default: 0 },
    responseTimes: { type: [Number], default: [] },
    timestamp: { type: Date, default: Date.now },
    userId: { type: String, default: null }
});

export const Tracking = mongoose.models.Tracking || mongoose.model("Tracking", trackingSchema);