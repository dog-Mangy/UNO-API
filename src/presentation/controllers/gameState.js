import { PlayerGameStateService } from "../../business/services/playerGameStateService.js";

export const updateReadyState = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { userId, ready } = req.body;

        const result = await PlayerGameStateService.updateReadyState(gameId, userId, ready);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
