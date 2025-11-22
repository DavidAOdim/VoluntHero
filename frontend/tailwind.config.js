/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Mapping CSS variables to Tailwind utility classes
      colors: {
        surface: "var(--surface)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        ring: "var(--ring)",

        // Primary Accent Color Mapping
        "primary-accent": {
          DEFAULT: "var(--accent)",
          1: "var(--accent-1)",
          2: "var(--accent-2)",
          3: "var(--accent-3)",
          4: "var(--accent-4)",
          5: "var(--accent-5)",
        },

        // Semantic Colors
        danger: "var(--danger)",
        success: "var(--accent-2)", // Using accent-2 for success based on App.css
        info: "var(--accent-3)", // Using accent-3 for info based on App.css
      },

      // Defining standard font sizes for better hierarchy
      fontSize: {
        xs: ".75rem",
        sm: ".875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem", // Better H1 size
      },
    },
  },
  plugins: [],
};
