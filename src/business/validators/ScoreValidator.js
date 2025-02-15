import { ValidationError } from "../../utils/customErrors.js";

export class ScoreValidator {
    static validateScoreData(playerId, gameId, scoreData) {
        if (!playerId || !gameId || !scoreData.baseScore) {
            throw new ValidationError("All fields are required");
        }

        if (typeof scoreData.baseScore !== "number" || scoreData.baseScore < 0) {
            throw new ValidationError("The score must be a positive number.");
        }
    }
}
