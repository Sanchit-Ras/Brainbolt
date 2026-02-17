import { useEffect, useState } from 'react';
import { api, LeaderboardEntry } from '../api';
import { useTheme } from '../ThemeContext';

const Leaderboard = () => {
    const { theme } = useTheme();
    const [scores, setScores] = useState<LeaderboardEntry[]>([]);
    const [streaks, setStreaks] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'score' | 'streak'>('score');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [scoreData, streakData] = await Promise.all([
                    api.getLeaderboardScore(),
                    api.getLeaderboardStreak()
                ]);
                setScores(scoreData);
                setStreaks(streakData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing.xl, color: theme.colors.textSecondary }}>
            Loading leaderboard...
        </div>
    );

    const currentData = activeTab === 'score' ? scores : streaks;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '640px',
            margin: '0 auto',
            width: '100%'
        }}>
            <h2 style={{ 
                marginBottom: theme.spacing.lg, 
                fontSize: '2rem', 
                color: theme.colors.text,
                textAlign: 'center' 
            }}>
                Leaderboard
            </h2>

            <div style={{ 
                display: 'flex', 
                gap: theme.spacing.md, 
                marginBottom: theme.spacing.xl,
                background: theme.colors.surface,
                padding: '4px',
                borderRadius: theme.radius.full,
                boxShadow: theme.shadows.sm,
                border: `1px solid ${theme.colors.border}`
            }}>
                <TabButton 
                    active={activeTab === 'score'} 
                    onClick={() => setActiveTab('score')} 
                    label="Top Scores"
                    theme={theme}
                />
                <TabButton 
                    active={activeTab === 'streak'} 
                    onClick={() => setActiveTab('streak')} 
                    label="Top Streaks"
                    theme={theme}
                />
            </div>

            <div style={{ 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: theme.spacing.sm 
            }}>
                {currentData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.textSecondary }}>
                        No entries yet. Be the first!
                    </div>
                ) : (
                    currentData.map((entry, index) => {
                        let rankColor = theme.colors.textSecondary;
                        let rankBg = 'transparent';
                        
                        if (index === 0) { rankColor = '#FFD700'; rankBg = 'rgba(255, 215, 0, 0.1)'; } // Gold
                        if (index === 1) { rankColor = '#C0C0C0'; rankBg = 'rgba(192, 192, 192, 0.1)'; } // Silver
                        if (index === 2) { rankColor = '#CD7F32'; rankBg = 'rgba(205, 127, 50, 0.1)'; } // Bronze

                        return (
                            <div key={entry.userId} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: theme.colors.surface,
                                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                                borderRadius: theme.radius.md,
                                boxShadow: theme.shadows.sm,
                                border: `1px solid ${theme.colors.border}`,
                                transition: 'transform 0.2s',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: theme.radius.full,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        color: rankColor,
                                        background: rankBg,
                                        fontSize: '1.1rem'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: theme.colors.text }}>
                                        {entry.userId.substring(0, 8)}...
                                    </div>
                                </div>
                                <div style={{ 
                                    fontWeight: 700, 
                                    fontSize: '1.25rem', 
                                    color: activeTab === 'score' ? theme.colors.primary : theme.colors.accent 
                                }}>
                                    {activeTab === 'score' ? entry.totalScore : entry.maxStreak}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <div style={{ marginTop: theme.spacing.xl, fontSize: '0.85rem', color: theme.colors.textSecondary, textAlign: 'center' }}>
                * Displaying top 10 players. Updates in real-time.
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label, theme }: any) => (
    <button
        onClick={onClick}
        style={{
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            background: active ? theme.colors.primary : 'transparent',
            border: 'none',
            borderRadius: theme.radius.full,
            color: active ? '#ffffff' : theme.colors.textSecondary,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            boxShadow: active ? theme.shadows.sm : 'none'
        }}
    >
        {label}
    </button>
);

export default Leaderboard;
