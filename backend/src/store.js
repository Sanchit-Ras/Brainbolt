"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.Store = void 0;
const types_1 = require("./types");
const uuid_1 = require("uuid");
class Store {
    questions = [];
    userStates = new Map();
    constructor() {
        this.seedQuestions();
    }
    seedQuestions() {
        // Generate at least 3 questions per difficulty 1-10
        for (let d = 1; d <= 10; d++) {
            for (let i = 1; i <= 3; i++) {
                this.questions.push({
                    id: (0, uuid_1.v4)(),
                    difficulty: d,
                    prompt: `Diff ${d} Question ${i}: What is ${d} + ${i}?`,
                    choices: [`${d + i}`, `${d + i + 1}`, `${d + i - 1}`, `${d * i}`],
                    correctAnswer: `${d + i}`
                });
            }
        }
    }
    getQuestion(difficulty) {
        const pool = this.questions.filter(q => q.difficulty === difficulty);
        if (pool.length === 0) {
            // Fallback if no exact match (should not happen with seeding)
            return this.questions[0];
        }
        return pool[Math.floor(Math.random() * pool.length)];
    }
    getQuestionById(id) {
        return this.questions.find(q => q.id === id);
    }
    getUserState(userId) {
        if (!this.userStates.has(userId)) {
            this.userStates.set(userId, {
                userId,
                currentDifficulty: 5, // Start at 5
                streak: 0,
                maxStreak: 0,
                totalScore: 0,
                correctCount: 0,
                totalAttempts: 0,
                stateVersion: 0,
                lastAnswerAt: Date.now()
            });
        }
        return this.userStates.get(userId);
    }
    updateUserState(state) {
        this.userStates.set(state.userId, state);
    }
    getLeaderboardScore() {
        return Array.from(this.userStates.values())
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);
    }
    getLeaderboardStreak() {
        return Array.from(this.userStates.values())
            .sort((a, b) => b.maxStreak - a.maxStreak)
            .slice(0, 10);
    }
    getRank(userId) {
        const scoreSorted = Array.from(this.userStates.values()).sort((a, b) => b.totalScore - a.totalScore);
        const streakSorted = Array.from(this.userStates.values()).sort((a, b) => b.maxStreak - a.maxStreak);
        const scoreRank = scoreSorted.findIndex(u => u.userId === userId) + 1;
        const streakRank = streakSorted.findIndex(u => u.userId === userId) + 1;
        return { scoreRank, streakRank };
    }
}
exports.Store = Store;
exports.store = new Store();
//# sourceMappingURL=store.js.map