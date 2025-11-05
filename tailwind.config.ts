import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        gentle: '0 4px 20px -4px hsla(210, 21%, 21%, 0.1)',
        button: '0 2px 8px -2px hsla(178, 67%, 55%, 0.3)',
        'button-strong': '0 4px 12px -2px hsla(178, 67%, 55%, 0.4)',
        'button-stronger': '0 6px 16px -2px hsla(178, 67%, 55%, 0.5)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        accent: 'hsl(var(--accent))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        numbers: 'hsl(var(--numbers))',
        'storybook-1': 'hsl(var(--storybook-1))',
        'storybook-2': 'hsl(var(--storybook-2))',
      },
      fontFamily: {
        sans: ["'Lato'", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
        },
        'fade-out': {
            '0%': { opacity: '1' },
            '100%': { opacity: '0' },
        },
        'slide-in-from-bottom': {
            '0%': { transform: 'translateY(100%)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out-to-bottom': {
            '0%': { transform: 'translateY(0)', opacity: '1' },
            '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'animate-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.5s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.5s ease-out',
        'slide-out-to-bottom': 'slide-out-to-bottom 0.5s ease-out',
        'float': 'animate-float 15s ease-in-out infinite',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;