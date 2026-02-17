# Brainbolt LLD

## Module Responsibilities

- **QuizController**: Handles HTTP requests for quiz flow (next question, answer submission).
- **AdaptiveEngine**: Determines the next question difficulty based on user performance.
- **ScoreEngine**: Calculates score updates based on difficulty, streak, and correctness.
- **LeaderboardService**: Manages leaderboard data retrieval and updates.
- **UserStateStore**: Interface for storing and retrieving user state (In-Memory for MVP).

## DB Schema (Design Only)

- **users**(id, createdAt)
- **questions**(id, difficulty, prompt, choices, correctAnswerHash)
- **user_state**(userId PK, currentDifficulty, streak, maxStreak, totalScore, stateVersion, lastAnswerAt)
- **answer_log**(id, userId, questionId, difficulty, correct, scoreDelta, streakAtAnswer, answeredAt)

### Indexes

- `user_state(userId)`
- `answer_log(userId, answeredAt)`
- `leaderboard_score(totalScore DESC)`

## 4. Redis Strategy (Detail)

Although the current MVP uses an in-memory store, the production version will utilize Redis for high-performance state management and leaderboard operations.

### Key Data Structures

1. **User State (`HASH`)**
   - Key: `user:{userId}`
   - Fields: `score`, `streak`, `maxStreak`, `difficulty`, `stateVersion`, `lastActionTimestamp`
   - Purpose: Fast retrieval and atomic updates (using `HINCRBY`) of user progress.

2. **Leaderboards (`ZSET`)**
   - **Score Leaderboard**: `leaderboard:score`
     - Score: `totalScore`
     - Member: `userId`
   - **Streak Leaderboard**: `leaderboard:streak`
     - Score: `maxStreak`
     - Member: `userId`
   - Purpose: `ZADD` to update scores, `ZREVRANGE` to fetch top N users efficiently (O(log(N))).

3. **Idempotency Keys (`STRING` with TTL)**
   - Key: `idempotency:{key}`
   - Value: `response_payload`
   - TTL: 24 hours
   - Purpose: Prevent duplicate processing of the same answer submission.

4. **Rate Limiting (`STRING` / `INCR`)**
   - Key: `ratelimit:{userId}:{window_timestamp}`
   - Purpose: Count requests per time window.

### Caching Strategy

- Static content (Questions) can be cached in Redis or CDN.
- User profiles can be cached with a Write-Through strategy to ensure consistency with the persistent DB (Postgres/Mongo).

## 5. Stateless Architecture

The backend is designed to be **stateless**, meaning no session data is permanently stored in the application process memory (except for the temporary in-memory MVP store).

### Benefits

1. **Scalability**: New server instances can be spun up/down without data loss. Any request can be handled by any instance.
2. **Reliability**: Server crashes do not lose user data (once persisted to Redis/DB).
3. **Simplicity**: No need for "sticky sessions" at the load balancer level.

### Implementation Details

- **State in Request/DB**: All necessary context (UserID, QuestionID, StateVersion) is passed in the request or retrieved from the external store (Redis).
- **Graceful Shutdown**: Servers stop accepting new connections and finish processing current ones before terminating.

## 6. Leaderboard Update Strategy

To handle high write throughput while maintaining real-time leaderboards:

1. **Real-time**: Use Redis `ZADD` immediately upon each answer submission. This is fast (O(log(N))).
2. **Batch Persistence**: A background worker periodically (e.g., every 10s) dumps high scores from Redis to the persistent database for backup and analytics.
3. **Optimizations**:
   - **Sharding**: For millions of users, create multiple ZSETS (e.g., by region or difficulty tier) and aggregate top K.
   - **Limit Size**: Periodically trim the ZSET to keep only top 1000 users if full ranking isn't required (using `ZREMRANGEBYRANK`).

## 7. Edge Cases & Handling

- **Race Conditions**: Handled via `stateVersion` check. If the client sends an outdated version, the server rejects it (409 Conflict), forcing a state refresh.
- **Network Failures**: Idempotency keys ensure retries don't double-count scores.
- **Cheating**: Server-side validation of answers and time-based checks (minimum time to answer vs. human reaction time) can flag suspicious activity.
