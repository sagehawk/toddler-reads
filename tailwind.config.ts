import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        gentle: '0 4px 20px -4px hsla(210, 21%, 21%, 0.1)',
        button: '0 2px 8px -2px hsla(178, 67%, 55%, 0.3)',
      },
      colors: {
        background: 'hsl(40, 100%, 97%)',
        foreground: 'hsl(210, 21%, 21%)',
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        destructive: {
          DEFAULT: 'hsl(0, 84.2%, 60.2%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
        accent: 'hsl(178, 67%, 55%)',
      },
      fontFamily: {
        sans: ["'Nunito'", "sans-serif"],
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