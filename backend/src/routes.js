"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const store_1 = require("./store");
const types_1 = require("./types");
const router = (0, express_1.Router)();
// Middleware to get or create basic user session could be here, 
// for now we trust the client sends userId or we generate one.
// The flow expects client to hit /quiz/next first.
router.get('/quiz/next', (req, res) => {
    let { userId } = req.query;
    if (!userId) {
        userId = (0, uuid_1.v4)();
    }
    const userState = store_1.store.getUserState(userId);
    const question = store_1.store.getQuestion(userState.currentDifficulty);
    // Create a session ID? Not strictly needed for MVP logic as we use stateVersion.
    // But let's follow the spec.
    const response = {
        questionId: question.id,
        difficulty: question.difficulty,
        prompt: question.prompt,
        choices: question.choices, // Ensure this is shuffled if needed, but simple for now
        sessionId: userId, // Reusing userId as session for simplicity in MVP
        stateVersion: userState.stateVersion,
        currentScore: userState.totalScore,
        currentStreak: userState.streak
    };
    res.json(response);
});
router.post('/quiz/answer', (req, res) => {
    const { userId, questionId, selectedAnswer, stateVersion } = req.body;
    if (!userId || !questionId || selectedAnswer === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const userState = store_1.store.getUserState(userId);
    // Concurrency check
    if (stateVersion !== undefined && userState.stateVersion !== stateVersion) {
        // In a real app we might error, but for this MVP asking for "Next" acts as sync.
        // Or we reject. Let's reject to be safe.
        return res.status(409).json({ error: 'State mismatch. Please fetch next question.' });
    }
    const question = store_1.store.getQuestionById(questionId);
    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }
    const correct = question.correctAnswer === selectedAnswer;
    const now = Date.now();
    let scoreDelta = 0;
    // Update stats
    userState.totalAttempts++;
    if (correct) {
        userState.correctCount++;
        userState.streak++;
        // Score Formula
        // difficultyWeight = difficulty * 10
        // streakMultiplier = min(1 + (streak * 0.1), 2.0)
        // scoreDelta = difficultyWeight * streakMultiplier
        const difficultyWeight = question.difficulty * 10;
        const streakMultiplier = Math.min(1 + (userState.streak * 0.1), 2.0);
        scoreDelta = Math.floor(difficultyWeight * streakMultiplier);
        userState.totalScore += scoreDelta;
        userState.maxStreak = Math.max(userState.maxStreak, userState.streak);
        // Adaptive Logic: Increase difficulty only if streak >= 2
        if (userState.streak >= 2) {
            userState.currentDifficulty = Math.min(10, userState.currentDifficulty + 1);
        }
    }
    else {
        userState.streak = 0;
        // Adaptive Logic: Decrease difficulty immediately on wrong answer
        userState.currentDifficulty = Math.max(1, userState.currentDifficulty - 1);
    }
    userState.lastAnswerAt = now;
    userState.stateVersion++;
    store_1.store.updateUserState(userState);
    const { scoreRank, streakRank } = store_1.store.getRank(userId);
    const response = {
        correct,
        correctAnswer: question.correctAnswer,
        newDifficulty: userState.currentDifficulty,
        newStreak: userState.streak,
        scoreDelta,
        totalScore: userState.totalScore,
        stateVersion: userState.stateVersion,
        leaderboardRankScore: scoreRank,
        leaderboardRankStreak: streakRank
    };
    res.json(response);
});
router.get('/leaderboard/score', (req, res) => {
    const leaderboard = store_1.store.getLeaderboardScore();
    res.json(leaderboard);
});
router.get('/leaderboard/streak', (req, res) => {
    const leaderboard = store_1.store.getLeaderboardStreak();
    res.json(leaderboard);
});
exports.default = router;
//# sourceMappingURL=routes.js.map