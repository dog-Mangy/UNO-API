import { ScoreStrategy } from "./ScoreStrategy.js";

export class BonusScoreStrategy extends ScoreStrategy {
    calculateScore(scoreData) {
        return scoreData.baseScore + (scoreData.bonus || 0); 
    }
}