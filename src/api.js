import axios from 'axios';

const api = axios.create({
  baseURL: 'https://natekarbackend.onrender.com/api', // Ensure this points to your server
});

export default api;