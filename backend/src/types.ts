export interface Question {
    id: string;
    difficulty: number;
    prompt: string;
    choices: string[];
    correctAnswer: string;
}

export interface UserState {
    userId: string;
    currentDifficulty: number;
    streak: number;
    maxStreak: number;
    totalScore: number;
    correctCount: number;
    totalAttempts: number;
    stateVersion: number;
    lastAnswerAt: number;
}

export interface AnswerLog {
    id: string;
    userId: string;
    questionId: string;
    difficulty: number;
    correct: boolean;
    scoreDelta: number;
    streakAtAnswer: number;
    answeredAt: number;
}

export interface Metrics {
    currentDifficulty: number;
    streak: number;
    maxStreak: number;
    totalScore: number;
    accuracy: number;
    difficultyHistogram: Record<number, number>;
    recentPerformance: number; // percentage correct of last 5
}
export interface AnswerRequest {
    userId: string;
    questionId: string;
    selectedAnswer: string;
    stateVersion: number;
    answerIdempotencyKey?: string;
}

export interface AnswerResponse {
    correct: boolean;
    correctAnswer: string; 
    newDifficulty: number;
    newStreak: number;
    scoreDelta: number;
    totalScore: number;
    stateVersion: number;
    leaderboardRankScore: number;
    leaderboardRankStreak: number;
}

export interface NextQuestionResponse {
    questionId: string;
    difficulty: number;
    prompt: string;
    choices: string[];
    sessionId: string;
    stateVersion: number;
    currentScore: number;
    currentStreak: number;
}
