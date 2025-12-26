export const analyzeVideoContent = async (filePath: string, title: string = '', description: string = ''): Promise<{ result: 'safe' | 'flagged'; confidence: number }> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    const flaggedKeywords = ['violence', 'adult', 'explicit', 'blood', 'attack', 'kill', 'death', 'nude', 'nsfw'];

    const textToScan = `${filePath} ${title} ${description}`.toLowerCase();

    let isFlagged = false;
    for (const word of flaggedKeywords) {
        if (textToScan.includes(word)) {
            isFlagged = true;
            break;
        }
    }

    const result = isFlagged ? 'flagged' : 'safe';
    // High confidence if we found a keyword, random high confidence if safe
    const confidence = isFlagged ? 0.95 : (Math.random() * (0.99 - 0.8) + 0.8);

    return { result, confidence };
};
