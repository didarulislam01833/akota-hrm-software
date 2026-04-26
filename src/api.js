import axios from 'axios';

const API = axios.create({
    // এটি অটোমেটিক আপনার .env থেকে লিঙ্কটি নিয়ে নেবে
    baseURL: import.meta.env.VITE_API_BASE_URL
});

// এই অংশটি থাকলে আপনাকে আর কষ্ট করে প্রতি ফাইলে 'Bearer token' লিখতে হবে না
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;