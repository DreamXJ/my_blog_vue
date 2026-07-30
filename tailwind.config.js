/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主题变量（通过 CSS 变量驱动，跟随主题切换）
        deep: {
          base: 'var(--bg-base)',
          50: '#F8F9FC',
          100: '#E8ECF4',
          200: '#C8D0E0',
          300: '#9CA8C0',
          400: '#6B7A98',
          500: '#4A556B',
          600: '#364152',
          700: '#28303F',
          800: '#1A2130',
          900: '#121823',
          950: 'var(--bg-base)',
        },
        // 主强调色（CSS 变量）
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: 'var(--color-primary)',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // 辅助色
        purple: {
          DEFAULT: 'var(--color-secondary)',
        },
        cyan: {
          DEFAULT: '#06B6D4',
        },
        // 玻璃卡片色
        glass: {
          DEFAULT: 'var(--bg-card)',
          hover: 'var(--bg-card-hover)',
          border: 'var(--border-subtle)',
          'border-hover': 'var(--border-hover)',
          shine: 'rgba(255, 255, 255, 0.03)',
        },
      },
      // 文本层级
      textColor: {
        heading: 'var(--text-heading)',
        body: 'var(--text-body)',
        secondary: 'var(--text-muted)',
        muted: 'var(--text-dim)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '"Noto Sans SC"',
          '"Source Han Sans SC"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Cascadia Code"',
          'Consolas',
          'monospace',
        ],
        display: [
          'Inter',
          '"Noto Sans SC"',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        // 标题层级
        'display-lg': ['3.5rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display': ['2.75rem', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'heading-xl': ['2rem', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '-0.01em' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'body': ['1rem', { lineHeight: '1.75' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'gl': '12px',
        'gxl': '16px',
        'g2xl': '20px',
        'g3xl': '24px',
      },
      boxShadow: {
        // 玻璃阴影系统
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        // 悬浮发光阴影
        'glow-sm': '0 0 20px rgba(59, 130, 246, 0.06)',
        'glow': '0 0 30px rgba(59, 130, 246, 0.08), 0 0 60px rgba(139, 92, 246, 0.04)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.12), 0 0 80px rgba(139, 92, 246, 0.06)',
        // 按钮阴影
        'btn-glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'btn-glow-hover': '0 0 30px rgba(59, 130, 246, 0.25), 0 0 60px rgba(139, 92, 246, 0.1)',
      },
      backgroundImage: {
        // 渐变系统
        'gradient-primary': 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
        'gradient-primary-reverse': 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
        'gradient-cyan': 'linear-gradient(135deg, #06B6D4, #3B82F6)',
        'gradient-accent': 'linear-gradient(135deg, #3B82F6, #06B6D4, #8B5CF6)',
        'gradient-glow': 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08))',
        'gradient-card': 'linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(139, 92, 246, 0.02))',
        'gradient-hero': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.08), transparent), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(139, 92, 246, 0.05), transparent)',
        'gradient-code': 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        'gradient-border': 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.2))',
        'gradient-border-subtle': 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
        'gradient-text': 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      },
      animation: {
        'glow-flow': 'glowFlow 8s ease-in-out infinite alternate',
        'glow-flow-slow': 'glowFlow 12s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        glowFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'reading': '680px',
        'content': '1100px',
      },
      lineHeight: {
        'reading': '1.75',
        'tight': '1.2',
        'snug': '1.4',
        'relaxed': '1.625',
        'loose': '2',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      zIndex: {
        'navbar': '100',
        'modal': '200',
        'overlay': '300',
      },
    },
  },
  plugins: [],
}
