import axios from 'axios';

const API = axios.create({
    // এখানে আপনার Render-এর লিঙ্কটি থাকবে
    baseURL: 'https://akota-hrm-server.onrender.com/api',
});

// এই অংশটি অটোমেটিক টোকেন পাঠাতে সাহায্য করবে
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token.replace(/"/g, '')}`;
    }
    return req;
});

export default API;