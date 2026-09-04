import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(221 83% 53%)",
          foreground: "hsl(0 0% 100%)"
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(0 0% 100%)"
        },
        success: {
          DEFAULT: "hsl(142 71% 45%)",
          foreground: "hsl(0 0% 100%)"
        },
        muted: {
          DEFAULT: "hsl(220 14% 96%)",
          foreground: "hsl(220 9% 46%)"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem"
      }
    }
  },
  plugins: []
};

export default config;
