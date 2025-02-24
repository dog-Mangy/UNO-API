import { GameHistoryService } from "../../business/services/gameHistoryService.js";

export const getGameHistory = async (req, res, next) => {
    try {
        const { gameId } = req.params;

        const history = await GameHistoryService.getHistory(gameId);

        return res.status(200).json({ history });
    } catch (error) {
        next(error);
    }
};
