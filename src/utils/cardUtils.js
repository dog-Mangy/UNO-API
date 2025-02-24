export function generateRandomCard(gameId, playerId) {
    const colors = ["red", "yellow", "green", "blue"];
    const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "drawTwo", "wild", "wildDrawFour"];
    
    return {
        gameId,
        playerId, 
        color: colors[Math.floor(Math.random() * colors.length)],
        value: values[Math.floor(Math.random() * values.length)],
        discarded: false
    };
}
