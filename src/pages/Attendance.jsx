import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCheck, FaClock, FaMapMarkerAlt, FaSync, FaExternalLinkAlt } from 'react-icons/fa';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token')?.replace(/"/g, '');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [empRes, attRes] = await Promise.all([
                axios.get('http://localhost:5000/api/employees', config),
                axios.get('http://localhost:5000/api/attendance/all', config)
            ]);

            setEmployees(empRes.data);
            setAttendanceRecords(attRes.data);
        } catch (err) {
            console.error("Error fetching attendance:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const getStatus = (empId) => {
        if (!empId) return { time: '--:--', status: 'Pending', location: '---', lat: null, lng: null, isLive: false };

        const record = attendanceRecords.find(r => {
            const recordEmpId = r.employee?._id ? r.employee._id.toString() : r.employee?.toString();
            return recordEmpId === empId.toString();
        });

        if (record) {
            return {
                time: record.checkIn?.time || '--:--',
                status: record.status || 'Present',
                location: record.checkIn?.locationName || 'Office',
                lat: record.checkIn?.lat,
                lng: record.checkIn?.lng,
                isLive: true
            };
        }
        return { time: '--:--', status: 'Pending', location: '---', lat: null, lng: null, isLive: false };
    };

    // গুগল ম্যাপে লোকেশন দেখার ফাংশন
    const openInGoogleMaps = (lat, lng) => {
        if (lat && lng) {
            window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
        }
    };

    return (
        <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Daily Attendance</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Presence & Location</p>
                </div>
                <button onClick={fetchAttendanceData} className="p-3 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors">
                    <FaSync className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">In Time</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => {
                            const att = getStatus(emp._id);
                            return (
                                <tr key={emp._id} className="bg-white group hover:bg-slate-50/50 transition-all border border-slate-100 shadow-sm rounded-2xl">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border-2 border-white shadow-sm">
                                                {emp.profilePicPath ? (
                                                    <img src={`http://localhost:5000/${emp.profilePicPath}`} alt="" className="w-full h-full object-cover" />
                                                ) : emp.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm leading-none mb-1">{emp.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{emp.designation}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 font-black text-xs text-slate-700">
                                            <FaClock className={att.isLive ? "text-blue-500" : "text-slate-300"} />
                                            {att.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${att.status === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {att.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div
                                            className={`flex items-center gap-2 text-xs font-bold transition-colors ${att.lat ? 'text-blue-600 cursor-pointer hover:underline' : 'text-slate-400'}`}
                                            onClick={() => openInGoogleMaps(att.lat, att.lng)}
                                        >
                                            <FaMapMarkerAlt className={att.isLive ? "text-red-500" : "text-slate-300"} />
                                            <div className="flex flex-col">
                                                <span>{att.location}</span>
                                                {att.lat && (
                                                    <span className="text-[8px] opacity-60 font-medium">
                                                        {att.lat.toFixed(4)}, {att.lng.toFixed(4)}
                                                    </span>
                                                )}
                                            </div>
                                            {att.lat && <FaExternalLinkAlt className="text-[8px] mb-2" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                            <div className="flex gap-0.5">
                                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                            </div>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;