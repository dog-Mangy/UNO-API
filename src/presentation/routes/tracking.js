import express from 'express';
import { errorHandler } from '../middlewares/errorHandler.js';
import { getPopularEndpoints, getRequestStats, getResponseTimes, getStatusCodes } from '../controllers/tracking.js';


export const trackingRouter = express.Router()





trackingRouter.get("/requests", getRequestStats);
trackingRouter.get("/response-times", getResponseTimes);
trackingRouter.get("/status-codes", getStatusCodes);
trackingRouter.get("/popular-endpoints", getPopularEndpoints);



trackingRouter.use(errorHandler);
