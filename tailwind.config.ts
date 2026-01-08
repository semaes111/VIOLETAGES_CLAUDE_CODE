import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e3a5f",
          50: "#f0f5fa",
          100: "#dce8f3",
          200: "#bdd4e9",
          300: "#90b8da",
          400: "#5d94c7",
          500: "#3d75b3",
          600: "#2e5a8f",
          700: "#1e3a5f",
          800: "#1a3251",
          900: "#162a43",
          950: "#0f1c2d",
        },
        secondary: {
          DEFAULT: "#c9a050",
          50: "#faf6eb",
          100: "#f4ecd4",
          200: "#e9d7a8",
          300: "#ddbf74",
          400: "#d2a84d",
          500: "#c9a050",
          600: "#b08038",
          700: "#8f622f",
          800: "#764f2d",
          900: "#644229",
          950: "#392214",
        },
        accent: {
          DEFAULT: "#2e5a8f",
          50: "#f2f7fc",
          100: "#e2ecf7",
          200: "#cbddf1",
          300: "#a7c6e7",
          400: "#7da9da",
          500: "#5e8ccf",
          600: "#4a72c1",
          700: "#2e5a8f",
          800: "#3b528f",
          900: "#344675",
          950: "#242d48",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
