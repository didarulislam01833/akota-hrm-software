import React, { useState, useEffect } from 'react';
import API from '../api'; // আমাদের কাস্টম API ইম্পোর্ট করলাম
import { FaPaperPlane, FaClock, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';

const LeaveApply = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user._id;

    const [formData, setFormData] = useState({
        employeeId: userId,
        leaveType: 'Sick Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const [myLeaves, setMyLeaves] = useState([]);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    // ১. এমপ্লয়ির নিজস্ব ছুটির হিস্ট্রি ফেচ করা
    const fetchMyLeaves = async () => {
        if (!userId) return;
        try {
            // baseURL বা headers দেওয়ার আর প্রয়োজন নেই
            const res = await API.get(`/api/leaves/my-leaves/${userId}`);
            setMyLeaves(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch leave history", err);
        }
    };

    useEffect(() => {
        fetchMyLeaves();
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            setStatus({ type: 'error', msg: "Authentication error! Please login again." });
            return;
        }

        setLoading(true);
        try {
            // ডাটা সাবমিট করার সময় API wrapper অটোমেটিক টোকেন ম্যানেজ করবে
            const res = await API.post('/api/leaves/apply', {
                ...formData,
                employeeId: userId
            });

            setStatus({ type: 'success', msg: res.data.message });
            setFormData({
                employeeId: userId,
                leaveType: 'Sick Leave',
                startDate: '',
                endDate: '',
                reason: ''
            });
            fetchMyLeaves();
        } catch (err) {
            setStatus({
                type: 'error',
                msg: err.response?.data?.message || "Failed to submit application"
            });
        } finally {
            setLoading(false);
            setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 animate-in slide-in-from-bottom-5 duration-700 text-left">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-[1000] text-slate-900 tracking-tighter uppercase leading-none">Leave Portal</h1>
                <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest italic">Request time off and track your application status</p>
            </div>

            {/* Success/Error Message */}
            {status.msg && (
                <div className={`p-6 rounded-3xl font-black text-[10px] uppercase tracking-widest text-white shadow-2xl mb-8 ${status.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
                    {status.msg}
                </div>
            )}

            {/* Application Form */}
            <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-slate-50 p-10 mb-16">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">Leave Category</label>
                            <select
                                value={formData.leaveType}
                                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                            >
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Casual Leave">Casual Leave</option>
                                <option value="Emergency Leave">Emergency Leave</option>
                                <option value="Annual Leave">Annual Leave</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">From</label>
                                <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">To</label>
                                <input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">Reason</label>
                        <textarea rows="3" required placeholder="Explain why you need leave..." value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"></textarea>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[5px] hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
                        {loading ? "Processing..." : <>Submit Application <FaPaperPlane /></>}
                    </button>
                </form>
            </div>

            {/* Table Section */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic">My Leave Requests</h3>
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-white">
                            <tr>
                                <th className="p-6 text-[9px] font-black uppercase tracking-widest">Type</th>
                                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-center">Duration</th>
                                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {myLeaves.length > 0 ? myLeaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-slate-50 transition-all">
                                    <td className="p-6">
                                        <div className="font-black text-slate-800 text-xs uppercase">{leave.leaveType}</div>
                                        <div className="text-[9px] text-slate-400 font-bold truncate max-w-[200px] mt-1">"{leave.reason}"</div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600">
                                            <FaCalendarAlt className="text-blue-500" size={10} />
                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                            leave.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                            {leave.status === 'Approved' ? <FaCheckCircle /> : leave.status === 'Rejected' ? <FaTimesCircle /> : <FaClock />}
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="p-10 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No previous requests found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveApply;