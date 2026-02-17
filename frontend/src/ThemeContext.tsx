import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, Theme } from './theme';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('brainbolt_theme');
        return saved ? saved === 'dark' : true; // Default to dark
    });

    const theme = isDark ? darkTheme : lightTheme;

    useEffect(() => {
        localStorage.setItem('brainbolt_theme', isDark ? 'dark' : 'light');
        document.body.style.backgroundColor = theme.colors.background;
        document.body.style.color = theme.colors.text;
    }, [isDark, theme]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
