import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { Suspense } from 'react';
import Quiz from './pages/Quiz';
import { ThemeProvider, useTheme } from './ThemeContext';

// Lazy load Leaderboard
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));

const Layout = () => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: theme.colors.background, 
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', 
            transition: 'background 0.3s ease, color 0.3s ease',
            color: theme.colors.text
        }}>
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                background: theme.colors.surface,
                borderBottom: `1px solid ${theme.colors.border}`,
                boxShadow: theme.shadows.sm,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backdropFilter: 'blur(10px)',
                opacity: 0.98
            }}>
                <div style={{ display: 'flex', gap: theme.spacing.xl, alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, background: `-webkit-linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Brainbolt
                    </h1>
                    <div style={{ display: 'flex', gap: theme.spacing.lg }}>
                        <Link to="/" style={{ color: theme.colors.text, textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }}>Quiz</Link>
                        <Link to="/leaderboard" style={{ color: theme.colors.text, textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }}>Leaderboard</Link>
                    </div>
                </div>
                <button 
                    onClick={toggleTheme}
                    style={{
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        border: 'none',
                        color: theme.colors.text,
                        width: '36px',
                        height: '36px',
                        borderRadius: theme.radius.full,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        fontSize: '1.1rem'
                    }}
                    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
            </nav>

            <main style={{ 
                padding: `${theme.spacing.xl} ${theme.spacing.md}`,
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Routes>
                    <Route path="/" element={<Quiz />} />
                    <Route path="/leaderboard" element={
                        <Suspense fallback={<div style={{ textAlign: 'center', padding: theme.spacing.xl }}>Loading Leaderboard...</div>}>
                            <Leaderboard />
                        </Suspense>
                    } />
                </Routes>
            </main>
        </div>
    );
};

function App() {
  return (
    <ThemeProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Layout />
        </Router>
    </ThemeProvider>
  );
}

export default App;
