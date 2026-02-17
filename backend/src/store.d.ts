import { Question, UserState } from './types';
export declare class Store {
    private questions;
    private userStates;
    constructor();
    private seedQuestions;
    getQuestion(difficulty: number): Question;
    getQuestionById(id: string): Question | undefined;
    getUserState(userId: string): UserState;
    updateUserState(state: UserState): void;
    getLeaderboardScore(): UserState[];
    getLeaderboardStreak(): UserState[];
    getRank(userId: string): {
        scoreRank: number;
        streakRank: number;
    };
}
export declare const store: Store;
//# sourceMappingURL=store.d.ts.map