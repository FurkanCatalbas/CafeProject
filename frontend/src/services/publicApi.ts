import axios from 'axios';

const configuredApiUrl = (process.env.REACT_APP_API_URL || '').trim();
const API_BASE_URL = configuredApiUrl || 'http://localhost:10101';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default publicApi;
