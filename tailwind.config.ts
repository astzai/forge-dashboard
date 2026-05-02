import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        display: ['Syne', "ui-sans-serif", "sans-serif"],
        sans: ['Inter', "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;
