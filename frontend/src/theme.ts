export const lightTheme = {
    colors: {
        background: '#f0f2f5',
        surface: '#ffffff',
        primary: '#646cff',
        primaryHover: '#535bf2',
        text: '#1a1a1a',
        textSecondary: '#65676b',
        success: '#36b37e',
        error: '#ff5630',
        warning: '#ffab00',
        accent: '#00b8d9',
        border: '#dddfe2'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        full: '9999px'
    },
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    breakpoints: {
        mobile: '480px',
        tablet: '768px',
        desktop: '1024px'
    },
    typography: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        body: '1rem',
        small: '0.875rem'
    }
};

export const darkTheme = {
    colors: {
        background: '#18191a',
        surface: '#242526',
        primary: '#646cff',
        primaryHover: '#747bff',
        text: '#e4e6eb',
        textSecondary: '#b0b3b8',
        success: '#36b37e',
        error: '#ff5630',
        warning: '#ffab00',
        accent: '#00b8d9',
        border: '#3e4042'
    },
    spacing: lightTheme.spacing,
    radius: lightTheme.radius,
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
    },
    breakpoints: lightTheme.breakpoints,
    typography: lightTheme.typography
};

export type Theme = typeof lightTheme;
