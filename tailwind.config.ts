import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Medidea primary brand colors (teal)
        primary: {
          DEFAULT: '#5FB8AC',
          50: '#F0F9F8',
          100: '#E8F5F3',
          200: '#C7E9E4',
          300: '#A6DDD5',
          400: '#85D1C6',
          500: '#5FB8AC',
          600: '#4A9B8F',
          700: '#3A7D73',
          800: '#2B5E56',
          900: '#1C3E3A',
        },
        sidebar: {
          DEFAULT: '#0A3A3A',
          hover: '#1A5252',
          active: '#5FB8AC',
          text: '#E2E8F0',
          textMuted: '#94A3B8',
        },
        content: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
        },
        // Accent colors for dashboard cards
        accent: {
          teal: {
            bg: '#E8F5F3',
            text: '#5FB8AC',
          },
          blue: {
            bg: '#E8F4F9',
            text: '#3B7EA1',
          },
          coral: {
            bg: '#FFF0EE',
            text: '#FF8B7B',
          },
          green: {
            bg: '#E8F7E6',
            text: '#6BBF59',
          }
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
