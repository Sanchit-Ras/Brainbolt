import { useEffect, useState, memo, useRef } from 'react';
import { api, Question, AnswerResponse } from '../api';
import { useTheme } from '../ThemeContext';

const Quiz = () => {
    const { theme } = useTheme();
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [answering, setAnswering] = useState(false);
    const [lastResult, setLastResult] = useState<AnswerResponse | null>(null);
    const [userId] = useState(() => localStorage.getItem('brainbolt_userid') || '');
    
    // Instance var equivalent for component
    const paramsRef = useRef<{ selected: string }>({ selected: '' });

    useEffect(() => {
        loadNextQuestion();
    }, []);

    const loadNextQuestion = async () => {
        setLoading(true);
        setLastResult(null);
        try {
            const data = await api.getNextQuestion(userId || undefined);
            setQuestion(data);
            if (!userId) {
                localStorage.setItem('brainbolt_userid', data.sessionId);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (choice: string) => {
        if (!question || answering || lastResult) return;
        setAnswering(true);
        try {
            const result = await api.submitAnswer(
                question.sessionId,
                question.questionId,
                choice,
                question.stateVersion
            );
            setLastResult(result);
            
            // Auto advance after short delay
            setTimeout(() => {
                loadNextQuestion();
                setAnswering(false);
            }, 1500);
        } catch (error) {
            console.error(error);
            setAnswering(false);
        }
    };

    if (loading && !question) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing.xl, color: theme.colors.textSecondary }}>
            Loading quiz...
        </div>
    );
    
    if (!question) return (
        <div style={{ textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.error }}>
            Failed to load question. Please refresh.
        </div>
    );

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '640px',
            margin: '0 auto',
            width: '100%'
        }}>
            {/* Stats Bar */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                width: '100%',
                marginBottom: theme.spacing.lg,
                gap: theme.spacing.md
            }}>
                <div style={statCardStyle(theme)}>
                    <span style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Difficulty</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.colors.primary }}>{question.difficulty}</span>
                </div>
                <div style={statCardStyle(theme)}>
                    <span style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Streak</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.colors.accent }}>
                        {lastResult ? lastResult.newStreak : question.currentStreak}
                    </span>
                </div>
                <div style={statCardStyle(theme)}>
                    <span style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.colors.success }}>
                        {lastResult ? lastResult.totalScore : question.currentScore}
                    </span>
                </div>
            </div>

            {/* Question Card */}
            <div style={{
                background: theme.colors.surface,
                padding: theme.spacing.xl,
                borderRadius: theme.radius.lg,
                boxShadow: theme.shadows.lg,
                width: '100%',
                boxSizing: 'border-box',
                textAlign: 'center',
                marginBottom: theme.spacing.xl,
                border: `1px solid ${theme.colors.border}`
            }}>
                <h2 style={{ 
                    margin: 0, 
                    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', // Responsive font size
                    color: theme.colors.text,
                    fontWeight: 700
                }}>
                    {question.prompt}
                </h2>
            </div>

            {/* Choices Grid */}
            <div style={{ 
                display: 'grid', 
                gap: theme.spacing.md, 
                width: '100%',
                // Mobile: 1 col, Tablet+: 2 cols
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))'
            }}>
                {question.choices.map((choice) => {
                    const isSelected = paramsRef.current?.selected === choice;
                    const isCorrectChoice = lastResult?.correctAnswer === choice;
                    const isWrongChoice = isSelected && lastResult && !lastResult.correct;

                    let bg = theme.colors.surface;
                    let borderColor = 'transparent';
                    let transform = 'scale(1)';
                    let boxShadow = theme.shadows.sm;

                    if (lastResult) {
                        if (isCorrectChoice) {
                            bg = theme.colors.success;
                            borderColor = theme.colors.success;
                            boxShadow = `0 0 15px ${theme.colors.success}40`;
                        } else if (isWrongChoice) {
                            bg = theme.colors.error;
                            borderColor = theme.colors.error;
                        } else {
                            bg = theme.colors.background; // Dim others
                        }
                    } else if (answering && isSelected) {
                        borderColor = theme.colors.primary;
                    }

                    return (
                        <button
                            key={choice}
                            onClick={() => {
                                paramsRef.current = { selected: choice }; 
                                handleAnswer(choice);
                            }}
                            disabled={answering || !!lastResult}
                            style={{
                                padding: theme.spacing.lg,
                                borderRadius: theme.radius.md,
                                border: `2px solid ${borderColor === 'transparent' ? theme.colors.surface : borderColor}`,
                                background: bg,
                                color: (isCorrectChoice || isWrongChoice) ? '#fff' : theme.colors.text,
                                cursor: (answering || !!lastResult) ? 'default' : 'pointer',
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                outline: 'none',
                                boxShadow: boxShadow,
                                transform: transform,
                                height: '100%',
                                minHeight: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (!answering && !lastResult) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = theme.shadows.md;
                                    e.currentTarget.style.borderColor = theme.colors.primary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!answering && !lastResult) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = theme.shadows.sm;
                                    e.currentTarget.style.borderColor = 'transparent';
                                }
                            }}
                        >
                            {choice}
                        </button>
                    );
                })}
            </div>
            
            {/* Feedback / Spacer */}
            <div style={{ 
                marginTop: theme.spacing.lg, 
                height: '40px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
            }}>
                {lastResult && (
                    <div style={{ 
                        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                        borderRadius: theme.radius.full,
                        background: lastResult.correct ? `${theme.colors.success}20` : `${theme.colors.error}20`,
                        color: lastResult.correct ? theme.colors.success : theme.colors.error,
                        fontWeight: 600,
                        border: `1px solid ${lastResult.correct ? theme.colors.success : theme.colors.error}`,
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        {lastResult.correct 
                            ? `Correct! +${lastResult.scoreDelta}` 
                            : 'Wrong Answer'}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper for consistent stat cards
const statCardStyle = (theme: any) => ({
    background: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.sm,
    textAlign: 'center' as const,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    gap: '4px',
    transition: 'transform 0.2s',
    cursor: 'default'
});

export default memo(Quiz);
