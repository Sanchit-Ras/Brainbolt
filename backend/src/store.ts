import { Question, UserState, AnswerLog, Metrics } from './types';
import { v4 as uuidv4 } from 'uuid';

export class Store {
    private questions: Question[] = [];
    private userStates: Map<string, UserState> = new Map();
    private answerLogs: AnswerLog[] = [];
    private processedAnswerKeys: Set<string> = new Set();

    constructor() {
        this.seedQuestions();
    }

    private seedQuestions() {
        // Generate at least 3 questions per difficulty 1-10
        for (let d = 1; d <= 10; d++) {
            for (let i = 1; i <= 3; i++) {
                const correctVal = d + i;
                const distractor1 = correctVal + 1;
                const distractor2 = correctVal - 1;
                const distractor3 = d * i;

                // Use a Set to ensure uniqueness
                const choicesSet = new Set([
                    correctVal.toString(),
                    distractor1.toString(),
                    distractor2.toString(),
                    distractor3.toString()
                ]);

                // If duplicates exist (e.g. d*i == d+i-1), fill with other numbers
                let offset = 2;
                while (choicesSet.size < 4) {
                    choicesSet.add((correctVal + offset).toString());
                    offset++;
                }

                // Convert to array and shuffle (optional, but good for randomness)
                // For now, just simplistic array from set
                const uniqueChoices = Array.from(choicesSet);

                this.questions.push({
                    id: uuidv4(),
                    difficulty: d,
                    prompt: `What is ${d} + ${i}?`,
                    choices: uniqueChoices,
                    correctAnswer: correctVal.toString()
                });
            }
        }
    }

    getQuestion(difficulty: number): Question {
        const pool = this.questions.filter(q => q.difficulty === difficulty);
        if (pool.length === 0) {
            return this.questions[0];
        }
        return pool[Math.floor(Math.random() * pool.length)];
    }

    getQuestionById(id: string): Question | undefined {
        return this.questions.find(q => q.id === id);
    }

    getUserState(userId: string): UserState {
        if (!this.userStates.has(userId)) {
            this.userStates.set(userId, {
                userId,
                currentDifficulty: 5,
                streak: 0,
                maxStreak: 0,
                totalScore: 0,
                correctCount: 0,
                totalAttempts: 0,
                stateVersion: 0,
                lastAnswerAt: Date.now()
            });
        }
        return this.userStates.get(userId)!;
    }

    updateUserState(state: UserState) {
        this.userStates.set(state.userId, state);
    }

    logAnswer(log: AnswerLog) {
        this.answerLogs.push(log);
    }

    isIdempotent(key: string): boolean {
        if (this.processedAnswerKeys.has(key)) return false;
        this.processedAnswerKeys.add(key);
        return true;
    }

    checkStreakDecay(userId: string): boolean {
        const state = this.getUserState(userId);
        const now = Date.now();
        // 30 minutes = 30 * 60 * 1000 = 1800000 ms
        if (now - state.lastAnswerAt > 1800000 && state.lastAnswerAt > 0) {
            if (state.streak > 0) {
                state.streak = 0;
                this.updateUserState(state);
                return true;
            }
        }
        return false;
    }

    getMetrics(userId: string): Metrics {
        const state = this.getUserState(userId);
        const userLogs = this.answerLogs.filter(l => l.userId === userId);
        
        // Difficulty Histogram
        const difficultyHistogram: Record<number, number> = {};
        userLogs.forEach(l => {
            difficultyHistogram[l.difficulty] = (difficultyHistogram[l.difficulty] || 0) + 1;
        });

        // Recent Performance (last 5)
        const recentLogs = userLogs.slice(-5);
        const recentCorrect = recentLogs.filter(l => l.correct).length;
        const recentPerformance = recentLogs.length > 0 ? (recentCorrect / recentLogs.length) * 100 : 0;

        const accuracy = state.totalAttempts > 0 ? state.correctCount / state.totalAttempts : 0;

        return {
            currentDifficulty: state.currentDifficulty,
            streak: state.streak,
            maxStreak: state.maxStreak,
            totalScore: state.totalScore,
            accuracy,
            difficultyHistogram,
            recentPerformance
        };
    }

    getLeaderboardScore(): UserState[] {
        return Array.from(this.userStates.values())
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);
    }

    getLeaderboardStreak(): UserState[] {
        return Array.from(this.userStates.values())
            .sort((a, b) => b.maxStreak - a.maxStreak)
            .slice(0, 10);
    }

    getRank(userId: string): { scoreRank: number, streakRank: number } {
        const scoreSorted = Array.from(this.userStates.values()).sort((a, b) => b.totalScore - a.totalScore);
        const streakSorted = Array.from(this.userStates.values()).sort((a, b) => b.maxStreak - a.maxStreak);
        
        const scoreRank = scoreSorted.findIndex(u => u.userId === userId) + 1;
        const streakRank = streakSorted.findIndex(u => u.userId === userId) + 1;

        return { scoreRank, streakRank };
    }
}

export const store = new Store();
