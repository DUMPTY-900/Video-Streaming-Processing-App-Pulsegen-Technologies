export const analyzeVideoContent = async (filePath: string): Promise<{ result: 'safe' | 'flagged'; confidence: number }> => {

    await new Promise(resolve => setTimeout(resolve, 3000));


    const isSafe = Math.random() > 0.3;
    const result = isSafe ? 'safe' : 'flagged';
    const confidence = Math.random() * (1 - 0.8) + 0.8; // 0.8 to 1.0

    return { result, confidence };
};
