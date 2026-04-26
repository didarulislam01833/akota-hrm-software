import React, { useState, useEffect } from 'react';
import API from '../api'; // কাস্টম API ইম্পোর্ট
import {
    FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt,
    FaSearch, FaFilter, FaLayerGroup
} from 'react-icons/fa';

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            // টোকেন বা বেস ইউআরএল অটোমেটিক হ্যান্ডেল হবে
            const res = await API.get('/api/leaves/all');
            setLeaves(res.data);
        } catch (err) {
            console.error("Failed to fetch leaves", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to set this to ${newStatus}?`)) return;

        setActionLoading(id);
        try {
            await API.put(`/api/leaves/update/${id}`, { status: newStatus });
            // লোকাল স্টেট আপডেট করে ইউজারকে ইনস্ট্যান্ট ফিডব্যাক দেওয়া
            setLeaves(leaves.map(leave => leave._id === id ? { ...leave, status: newStatus } : leave));
        } catch (err) {
            alert("Action failed: " + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    // সার্চ ফিল্টারিং লজিক
    const filteredLeaves = leaves.filter(leave =>
        leave.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.employee?.employeeId?.includes(searchTerm)
    );

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FD]">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-[#A3AED0] font-black text-[10px] uppercase tracking-[4px]">Syncing Records...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-10 font-sans text-left">
            <div className="max-w-[1400px] mx-auto">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-[#2B3674] tracking-tight uppercase leading-none">
                            Administrative Control
                        </h1>
                        <p className="text-[#A3AED0] font-bold mt-2 uppercase text-[10px] tracking-[3px] italic flex items-center gap-2">
                            <FaLayerGroup className="text-indigo-600" /> Absence & Leave Requests Management
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <StatCard label="Pending" count={leaves.filter(l => l.status === 'Pending').length} color="amber" />
                        <StatCard label="Total" count={leaves.length} color="indigo" />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">

                    <div className="px-8 py-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 w-full md:w-80 shadow-sm">
                            <FaSearch className="text-[#A3AED0] text-xs" />
                            <input
                                type="text"
                                placeholder="Search employee name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-bold text-[#2B3674] w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-[#2B3674] uppercase tracking-widest hover:bg-slate-50 transition-all">
                                <FaFilter size={10} /> Filter By Status
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[3px] text-[#A3AED0] text-left border-b border-slate-50">Staff Member</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[3px] text-[#A3AED0] text-center border-b border-slate-50">Leave Type</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[3px] text-[#A3AED0] text-center border-b border-slate-50">Duration</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[3px] text-[#A3AED0] text-left border-b border-slate-50">Reason & Details</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[3px] text-[#A3AED0] text-center border-b border-slate-50">Status</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[3px] text-[#A3AED0] text-right border-b border-slate-50">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLeaves.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-[#F4F7FE]/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-100 group-hover:scale-105 transition-transform shadow-sm uppercase">
                                                    {leave.employee?.name?.substring(0, 2) || '??'}
                                                </div>
                                                <div>
                                                    <div className="font-black text-[#2B3674] text-sm tracking-tight uppercase leading-none mb-1.5">{leave.employee?.name || 'Unknown User'}</div>
                                                    <div className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest leading-none">ID: {leave.employee?.employeeId || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#2B3674]">
                                                {leave.leaveType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex flex-col items-center p-2 bg-white rounded-xl border border-slate-50 shadow-sm min-w-[120px]">
                                                <span className="flex items-center gap-2 text-[10px] font-black text-[#2B3674]">
                                                    <FaCalendarAlt className="text-indigo-500" size={10} />
                                                    {new Date(leave.startDate).toLocaleDateString('en-GB')}
                                                </span>
                                                <div className="h-2 border-l border-slate-100 my-1"></div>
                                                <span className="text-[10px] font-black text-[#2B3674]">
                                                    {new Date(leave.endDate).toLocaleDateString('en-GB')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-xs">
                                            <div className="bg-[#F4F7FE]/50 p-3 rounded-xl border border-white">
                                                <p className="text-[11px] text-[#2B3674] font-bold italic leading-relaxed line-clamp-2">"{leave.reason}"</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <StatusBadge status={leave.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {leave.status === 'Pending' ? (
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        disabled={actionLoading === leave._id}
                                                        onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                                        className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 active:scale-90 disabled:opacity-50"
                                                        title="Approve Request"
                                                    >
                                                        {actionLoading === leave._id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaCheckCircle size={14} />}
                                                    </button>
                                                    <button
                                                        disabled={actionLoading === leave._id}
                                                        onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                                        className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md shadow-red-500/20 active:scale-90 disabled:opacity-50"
                                                        title="Reject Request"
                                                    >
                                                        <FaTimesCircle size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest italic bg-slate-50 px-3 py-1 rounded-lg">Log Verified</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredLeaves.length === 0 && (
                        <div className="py-32 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaClock className="text-slate-200" size={24} />
                            </div>
                            <div className="text-[#A3AED0] font-black text-[11px] uppercase tracking-[5px]">Queue is empty</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const StatCard = ({ label, count, color }) => (
    <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
        <div className={`w-2 h-10 rounded-full ${color === 'amber' ? 'bg-amber-400' : 'bg-indigo-600'}`}></div>
        <div>
            <p className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-[#2B3674] leading-none">{count}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
        Rejected: "bg-red-50 text-red-600 border-red-100",
        Pending: "bg-amber-50 text-amber-600 border-amber-100"
    };

    return (
        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.Pending}`}>
            {status}
        </span>
    );
};

export default LeaveManagement;