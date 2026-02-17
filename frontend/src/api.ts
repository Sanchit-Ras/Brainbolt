export const API_BASE_URL = 'http://localhost:4000/v1';

export interface Question {
    questionId: string;
    difficulty: number;
    prompt: string;
    choices: string[];
    sessionId: string;
    stateVersion: number;
    currentScore: number;
    currentStreak: number;
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

export interface LeaderboardEntry {
    userId: string;
    totalScore: number;
    maxStreak: number;
}

export const api = {
    getNextQuestion: async (userId?: string): Promise<Question> => {
        const url = userId ? `${API_BASE_URL}/quiz/next?userId=${userId}` : `${API_BASE_URL}/quiz/next`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch question');
        return res.json();
    },

    submitAnswer: async (userId: string, questionId: string, selectedAnswer: string, stateVersion: number): Promise<AnswerResponse> => {
        const res = await fetch(`${API_BASE_URL}/quiz/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, questionId, selectedAnswer, stateVersion }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to submit answer');
        }
        return res.json();
    },

    getLeaderboardScore: async (): Promise<LeaderboardEntry[]> => {
        const res = await fetch(`${API_BASE_URL}/leaderboard/score`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return res.json();
    },

    getLeaderboardStreak: async (): Promise<LeaderboardEntry[]> => {
        const res = await fetch(`${API_BASE_URL}/leaderboard/streak`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return res.json();
    }
};
