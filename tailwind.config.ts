import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E73D8",
          blue: "#1E73D8",
        },
        growth: {
          DEFAULT: "#38A34A",
          green: "#38A34A",
        },
        accent: {
          DEFAULT: "#F28C28",
          orange: "#F28C28",
        },
        navy: {
          DEFAULT: "#0B2242",
          deep: "#0B2242",
        },
      },
    },
  },
  plugins: [],
};
export default config;
