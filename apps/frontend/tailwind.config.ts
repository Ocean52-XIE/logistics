import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d8e7ff",
          500: "#173B67",
          600: "#0f2e52",
          700: "#102d4d",
          950: "#0a1426"
        },
        accent: {
          500: "#F28C28",
          600: "#d6781f"
        },
        teal: {
          500: "#2D9C8C"
        }
      },
      boxShadow: {
        panel: "0 20px 50px rgba(23, 59, 103, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
