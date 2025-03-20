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
        default: "#333333",
        primary: {
          DEFAULT: "#9333ea", // purple-600
          hover: "#7e22ce", // purple-700
          focus: "#a855f7", // purple-500
        },
        secondary: {
          DEFAULT: "#ffffff",
          hover: "#f9fafb", // gray-50
          focus: "#6b7280", // gray-500
          border: "#d1d5db", // gray-300
          text: "#374151", // gray-700
        },
        danger: {
          DEFAULT: "#ffffff",
          hover: "#fee2e2", // red-50
          text: "#ef4444", // red-500
          border: "#ef4444", // red-500
          focus: "#ef4444", // red-500
        },
        success: {
          DEFAULT: "#16a34a", // green-600
          hover: "#15803d", // green-700
          focus: "#22c55e", // green-500
        },
      },
      backgroundImage: {
        "gradient-purple-normal":
          "linear-gradient(to right, theme(colors.purple.600), theme(colors.indigo.600))",
      },
    },
  },
  plugins: [],
};

export default config;
