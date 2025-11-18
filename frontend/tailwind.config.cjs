/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#111827",
                accent: "#f97316",
                muted: "#6b7280",
            },
        },
    },
    plugins: [],
};
