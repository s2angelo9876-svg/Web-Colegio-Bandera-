/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Dark Mode Premium Midnight
        dark: {
          bg:      '#020617',  // Fondo ultra-oscuro (Slate-950)
          card:    '#0f172a',  // Tarjetas (Slate-900)
          border:  '#1e293b',  // Bordes (Slate-800)
          hover:   '#1e293b',  // Hover en elementos
          input:   '#0f172a',  // Fondo de inputs
          accent:  '#3b82f6',  // Acento azul (Blue-500)
        }
      }
    },
  },
  plugins: [],
}