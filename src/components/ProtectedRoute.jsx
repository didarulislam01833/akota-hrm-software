import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // যদি টোকেন না থাকে, তবে তাকে ধাক্কা দিয়ে লগইন পেজে পাঠিয়ে দাও
    if (!token) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;