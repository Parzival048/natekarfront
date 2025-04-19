/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // Ensure this matches your project structure
    theme: {
      extend: {
        colors: {
          primary: '#1a73e8',
          secondary: '#5f6368',
          background: '#ffffff',
          error: '#d93025',
          success: '#1e8e3e',
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        spacing: {
          '128': '32rem',
          '144': '36rem',
        },
      },   
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
    ],
  };