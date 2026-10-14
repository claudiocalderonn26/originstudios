import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F0E4",
        wine: "#790E19",
        deepwine: "#570B13",
        warmwhite: "#FFFCF7",
        ink: "#24211F",
        warmgray: "#8B8580"
      },
      fontFamily: {
        editorial: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
