import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-blue": "#0A56A6",
        "brand-dark": "#071B43",
        "brand-gray": "#B3B4B6",
        brand: {
          50: "#e8f1fa",
          100: "#d1e3f5",
          200: "#a3c7eb",
          300: "#75abe1",
          400: "#3d82c4",
          500: "#0A56A6",
          600: "#094a8f",
          700: "#083e78",
          800: "#071B43",
          900: "#05122e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
