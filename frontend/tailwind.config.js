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
        // Paleta Dark Mode personalizada
        dark: {
          bg:      '#111827',  // Fondo principal (gray-900)
          card:    '#1a2332',  // Tarjetas y contenedores
          border:  '#2a3441',  // Bordes
          hover:   '#243040',  // Hover en elementos
          input:   '#1f2937',  // Inputs y sub-elementos
          accent:  '#1a2d4a',  // Acentos azules suaves
        }
      }
    },
  },
  plugins: [],
}