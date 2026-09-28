import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

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
          bg: "#EAEBF0",
          panel: "#F5F6F8",
          card: "#FAFBFD",
          well: "#E4E6EB",
          border: "#D8DBE0",
          subtle: "#E4E6EB",
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
        sans: ["'SF Pro Display'", "-apple-system", "BlinkMacSystemFont", "'SF Pro Text'", "sans-serif"],
        mono: ["'SF Pro Display'", "-apple-system", "BlinkMacSystemFont", "'SF Pro Text'", "sans-serif"],
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("custom", ".custom &");
    }),
  ],
};
export default config;
