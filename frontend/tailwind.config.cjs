/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Work Sans', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: "#111827", // gray-900
                    light: "#1f2937",   // gray-800
                    dark: "#030712",    // gray-950
                },
                secondary: {
                    DEFAULT: "#f97316", // orange-500
                    light: "#fb923c",   // orange-400
                    dark: "#ea580c",    // orange-600
                },
                accent: "#f97316",
                muted: {
                    DEFAULT: "#6b7280", // gray-500
                    light: "#9ca3af",   // gray-400
                    dark: "#4b5563",    // gray-600
                },
                background: {
                    DEFAULT: "#ffffff",
                    soft: "#fdf9f3",    // Beige suave - warm background
                    dark: "#f9fafb",    // gray-50
                },
                warm: {
                    50: "#fdf9f3",      // Beige muy claro
                    100: "#f8f3e8",     // Beige claro
                    200: "#f0e6d5",     // Beige medio
                },
            },
        },
    },
    plugins: [],
};
