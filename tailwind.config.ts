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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Keep existing Medidea colors as extended palette if needed, or override
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
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          // Keep existing accents
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
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
