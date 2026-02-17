import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from './store';
import { AnswerRequest, AnswerResponse, NextQuestionResponse, AnswerLog } from './types';

const router = Router();

router.get('/quiz/next', (req, res) => {
    let { userId } = req.query as { userId?: string };
    
    if (!userId) {
        userId = uuidv4();
    }

    const userState = store.getUserState(userId);
    const question = store.getQuestion(userState.currentDifficulty);

    const response: NextQuestionResponse = {
        questionId: question.id,
        difficulty: question.difficulty,
        prompt: question.prompt,
        choices: question.choices, 
        sessionId: userId, 
        stateVersion: userState.stateVersion,
        currentScore: userState.totalScore,
        currentStreak: userState.streak
    };

    res.json(response);
});

router.post('/quiz/answer', (req, res) => {
    const { userId, questionId, selectedAnswer, stateVersion, answerIdempotencyKey } = req.body as AnswerRequest;
    
    if (!userId || !questionId || selectedAnswer === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Idempotency Check
    if (answerIdempotencyKey) {
        if (!store.isIdempotent(answerIdempotencyKey)) {
             // In a real idempotent system we'd return the saved response. 
             // For MVP, we'll just return 409 or a generic "already processed" to keep it simple,
             // or re-fetch the current state. Let's return 409 Conflict for "Already Processed".
             return res.status(409).json({ error: 'Duplicate submission' });
        }
    }

    const userState = store.getUserState(userId);

    // State Version Concurrent Check
    if (stateVersion !== undefined && userState.stateVersion !== stateVersion) {
         return res.status(409).json({ error: 'State mismatch. Please fetch next question.' });
    }

    // Streak Decay
    store.checkStreakDecay(userId);

    const question = store.getQuestionById(questionId);
    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    const correct = question.correctAnswer === selectedAnswer;
    const now = Date.now();

    let scoreDelta = 0;
    
    userState.totalAttempts++;
    if (correct) {
        userState.correctCount++;
        userState.streak++;
        
        // Score Formula with Accuracy
        // accuracyFactor = 0.5 + accuracy
        // scoreDelta = difficultyWeight * streakMultiplier * accuracyFactor
        const accuracy = userState.totalAttempts > 0 ? userState.correctCount / userState.totalAttempts : 0;
        const accuracyFactor = 0.5 + accuracy;
        const difficultyWeight = question.difficulty * 10;
        const streakMultiplier = Math.min(1 + (userState.streak * 0.1), 2.0);
        
        scoreDelta = Math.floor(difficultyWeight * streakMultiplier * accuracyFactor);
        
        userState.totalScore += scoreDelta;
        userState.maxStreak = Math.max(userState.maxStreak, userState.streak);

        if (userState.streak >= 2) {
            userState.currentDifficulty = Math.min(10, userState.currentDifficulty + 1);
        }
    } else {
        userState.streak = 0;
        userState.currentDifficulty = Math.max(1, userState.currentDifficulty - 1);
    }
    
    userState.lastAnswerAt = now;
    userState.stateVersion++;

    store.updateUserState(userState);

    // Log Answer
    const log: AnswerLog = {
        id: uuidv4(),
        userId,
        questionId,
        difficulty: question.difficulty,
        correct,
        scoreDelta,
        streakAtAnswer: userState.streak,
        answeredAt: now
    };
    store.logAnswer(log);

    const { scoreRank, streakRank } = store.getRank(userId);

    const response: AnswerResponse = {
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

router.get('/quiz/metrics', (req, res) => {
    const { userId } = req.query as { userId?: string };
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }
    const metrics = store.getMetrics(userId);
    res.json(metrics);
});

router.get('/leaderboard/score', (req, res) => {
    const leaderboard = store.getLeaderboardScore();
    res.json(leaderboard);
});

router.get('/leaderboard/streak', (req, res) => {
    const leaderboard = store.getLeaderboardStreak();
    res.json(leaderboard);
});

export default router;
