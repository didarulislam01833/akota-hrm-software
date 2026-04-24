import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
    FaUsers, FaUserCheck, FaUserClock, FaCalendarAlt,
    FaMapMarkerAlt, FaSync, FaUserTimes
} from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [statsData, setStatsData] = useState({
        totalEmployees: 0,
        presentToday: 0,
        lateEntries: 0,
        absentToday: 0,
        payroll: '৳0'
    });
    const [taskStats, setTaskStats] = useState([]);

    const API_BASE_URL = 'http://localhost:5000/api';

    const getAuthHeaders = useCallback(() => {
        let token = localStorage.getItem('token');
        if (token) {
            token = token.replace(/['"]+/g, '');
        }
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const config = getAuthHeaders();
                const [attendanceRes, taskRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/attendance/today-stats`, config),
                    axios.get(`${API_BASE_URL}/tasks/stats`, config)
                ]);

                if (attendanceRes.data) {
                    setStatsData({
                        totalEmployees: attendanceRes.data.totalEmployees || 0,
                        presentToday: attendanceRes.data.present || 0,
                        lateEntries: attendanceRes.data.late || 0,
                        absentToday: attendanceRes.data.absent || 0,
                        payroll: attendanceRes.data.payroll || '৳0'
                    });
                }
                setTaskStats(taskRes.data || []);

            } catch (err) {
                console.error("Dashboard Fetch Error:", err.response?.status, err.response?.data);
                if (err.response?.status === 401) {
                    if (logout) logout();
                }
            }
        };

        fetchDashboardData();
    }, [getAuthHeaders, logout]);

    const handleCheckIn = () => {
        if (!navigator.geolocation) {
            alert("আপনার ব্রাউজার জিপিএস সাপোর্ট করে না।");
            return;
        }
        const targetId = user?._id || user?.id;
        if (!targetId) {
            alert("ইউজার আইডি পাওয়া যায়নি। লগইন করুন।");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const config = getAuthHeaders();

                const res = await axios.post(`${API_BASE_URL}/attendance/checkin`, {
                    employeeId: targetId,
                    lat: latitude,
                    lng: longitude,
                    deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
                }, config);

                if (res.data.success) {
                    alert("✅ হাজিরা সফলভাবে সম্পন্ন হয়েছে!");
                    window.location.reload();
                }
            } catch (err) {
                alert(err.response?.data?.message || "হাজিরা দেওয়া সম্ভব হয়নি।");
            } finally {
                setLoading(false);
            }
        }, () => {
            alert("লোকেশন পারমিশন প্রয়োজন।");
            setLoading(false);
        }, { enableHighAccuracy: true });
    };

    const attendanceData = [
        { name: 'Sat', present: 110 }, { name: 'Sun', present: 115 },
        { name: 'Mon', present: 118 }, { name: 'Tue', present: 112 },
        { name: 'Wed', present: 120 }, { name: 'Thu', present: 116 },
    ];

    const stats = [
        { id: 1, label: 'Total Employees', value: statsData.totalEmployees, icon: <FaUsers />, color: 'text-indigo-600', bg: 'bg-[#F4F7FE]' },
        { id: 2, label: 'Present Today', value: statsData.presentToday, icon: <FaUserCheck />, color: 'text-emerald-500', bg: 'bg-[#F4F7FE]' },
        { id: 3, label: 'Late Entries', value: statsData.lateEntries, icon: <FaUserClock />, color: 'text-amber-500', bg: 'bg-[#F4F7FE]' },
        { id: 4, label: 'Absent Today', value: statsData.absentToday, icon: <FaUserTimes />, color: 'text-rose-500', bg: 'bg-[#F4F7FE]' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Stats Grid - Horizon UI Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-3xl flex items-center gap-4 shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
                        <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-full flex items-center justify-center text-xl`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">
                                {item.label}
                            </p>
                            <h2 className="text-2xl font-bold text-[#2B3674]">
                                {item.value}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Attendance Chart - Large Card */}
                <div className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-[#2B3674]">Workforce Trends</h3>
                            <p className="text-sm text-slate-400 font-medium">Weekly Attendance Overview</p>
                        </div>
                        <div className="flex gap-2 bg-[#F4F7FE] p-1 rounded-xl">
                            {taskStats.slice(0, 3).map((ts, idx) => (
                                <div key={idx} className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{ts.name}</p>
                                    <p className="text-xs font-black text-[#2B3674]">{ts.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData}>
                                <defs>
                                    <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4318FF" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF7" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 500 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0px 18px 40px rgba(112,144,176,0.12)' }}
                                />
                                <Area type="monotone" dataKey="present" stroke="#4318FF" strokeWidth={3} fillOpacity={1} fill="url(#colorInd)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Side Column */}
                <div className="lg:col-span-4 space-y-5">

                    {/* Check-in Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-[0px_18px_40px_rgba(112,144,176,0.12)] text-center">
                        <div className="w-20 h-20 bg-[#F4F7FE] text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
                            <FaMapMarkerAlt />
                        </div>
                        <h3 className="text-xl font-bold text-[#2B3674]">Location Check-in</h3>
                        <p className="text-slate-400 text-sm mt-2 mb-8 px-2">Verify your attendance using GPS coordinates.</p>

                        <button
                            onClick={handleCheckIn}
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${loading
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0px_10px_20px_rgba(67,24,255,0.2)] active:scale-95'
                                }`}
                        >
                            {loading ? <FaSync className="animate-spin mx-auto text-lg" /> : 'Confirm Presence'}
                        </button>
                    </div>

                    {/* Payroll Summary - Dark Accent */}
                    <div className="bg-[#11047A] p-7 rounded-3xl shadow-xl flex items-center justify-between overflow-hidden relative group">
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Est. Payroll</p>
                            <h2 className="text-3xl font-black text-white mt-1">{statsData.payroll}</h2>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl relative z-10 text-white text-2xl">
                            <FaCalendarAlt />
                        </div>
                        {/* Design Element */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;