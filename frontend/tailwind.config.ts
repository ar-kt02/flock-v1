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
      },
      backgroundImage: {
        "gradient-purple-normal":
          "linear-gradient(to right, theme(colors.purple.600), theme(colors.indigo.600))",
      },
    },
  },
  plugins: [],
};
export default config; // Export the configuration
