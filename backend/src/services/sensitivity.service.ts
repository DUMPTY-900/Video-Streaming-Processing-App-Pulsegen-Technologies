export const analyzeVideoContent = async (filePath: string): Promise<{ result: 'safe' | 'flagged'; confidence: number }> => {
    // Simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Random result for demo purposes
    const isSafe = Math.random() > 0.3; // 70% chance of being safe
    const result = isSafe ? 'safe' : 'flagged';
    const confidence = Math.random() * (1 - 0.8) + 0.8; // 0.8 to 1.0

    return { result, confidence };
};
