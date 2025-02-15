import { ScoreStrategy } from "./ScoreStrategy.js";

class StandardScoreStrategy extends ScoreStrategy {
    calculateScore(scoreData) {
        return scoreData.baseScore; 
    }
}