import React, { useState, useContext } from 'react';
import { FaMapMarkerAlt, FaSync } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const QuickAttendance = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleCheckIn = () => {
        if (!navigator.geolocation) return alert("GPS not supported");
        setLoading(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                await axios.post('http://localhost:5000/api/attendance/checkin', {
                    employeeId: user._id,
                    lat: latitude,
                    lng: longitude,
                    deviceType: 'Web'
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert("Attendance Marked!");
            } catch (err) {
                alert(err.response?.data?.message || "Error");
            } finally {
                setLoading(false);
            }
        });
    };

    return (
        <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl">
            <h3 className="font-black uppercase text-xs tracking-widest mb-2">Daily Presence</h3>
            <p className="text-blue-100 text-sm mb-4">আপনার আজকের হাজিরা নিশ্চিত করুন</p>
            <button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full py-3 bg-white text-blue-600 rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
                {loading ? <FaSync className="animate-spin" /> : <FaMapMarkerAlt />}
                {loading ? 'Processing...' : 'Check-in Now'}
            </button>
        </div>
    );
};

export default QuickAttendance;