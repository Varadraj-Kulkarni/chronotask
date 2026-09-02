import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
      },
      colors: {
        editorial: {
          bg: "#F4F4F5",
          panel: "#FAFAF9",
          border: "#E4E4E7",
          subtle: "#ECECEE",
          text: "#18181B",
          muted: "#71717A",
        },
        dark: {
          bg: "#09090B",
          panel: "#121214",
          subtle: "#18181B",
          border: "#27272A",
          text: "#FAFAFA",
          muted: "#A1A1AA",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "SF Pro Text", "sans-serif"],
        mono: ["Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "SF Pro Text", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
