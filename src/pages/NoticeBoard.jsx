import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    FaBullhorn, FaTrash, FaPlus, FaRegClock,
    FaInfoCircle, FaExclamationTriangle, FaCalendarDay
} from 'react-icons/fa';

const NoticeBoard = () => {
    const { user } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'General' });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notices/all', config);
            setNotices(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching notices", err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/notices/create', formData, config);
            setFormData({ title: '', content: '', category: 'General' });
            setShowForm(false);
            fetchNotices();
        } catch (err) {
            alert("Failed to post notice");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this notice?")) {
            try {
                await axios.delete(`http://localhost:5000/api/notices/${id}`, config);
                fetchNotices();
            } catch (err) {
                alert("Delete failed");
            }
        }
    };

    const getCategoryStyle = (cat) => {
        switch (cat) {
            case 'Urgent': return 'bg-rose-50 text-rose-500 border-rose-100';
            case 'Holiday': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
            case 'Event': return 'bg-indigo-50 text-indigo-500 border-indigo-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">

            {/* Top Stats/Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#2B3674]">Notice Board</h2>
                    <p className="text-sm text-slate-400 font-medium">Keep track of company announcements</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-[0_10px_20px_rgba(67,24,255,0.2)] hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        {showForm ? 'Cancel' : <><FaPlus className="text-xs" /> Post New Notice</>}
                    </button>
                )}
            </div>

            {/* Admin Editor - SaaS Modern Style */}
            {showForm && (
                <div className="bg-white rounded-3xl shadow-[0px_18px_40px_rgba(112,144,176,0.12)] p-8 animate-in slide-in-from-top-5 duration-500">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-[#2B3674] ml-1">Title</label>
                                <input
                                    required
                                    className="w-full mt-2 px-5 py-3.5 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-[#2B3674] font-medium transition-all"
                                    placeholder="Notice title..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-[#2B3674] ml-1">Category</label>
                                <select
                                    className="w-full mt-2 px-5 py-3.5 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-[#2B3674] font-medium cursor-pointer"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>General</option>
                                    <option>Urgent</option>
                                    <option>Holiday</option>
                                    <option>Event</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-[#2B3674] ml-1">Content</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full mt-2 px-5 py-3.5 bg-[#F4F7FE] border-none rounded-3xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-[#2B3674] font-medium transition-all resize-none"
                                placeholder="Describe the announcement..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button className="bg-[#2B3674] text-white px-10 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#1B2559] transition-all shadow-lg">
                                Publish Bulletin
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notices List - SaaS Minimalist Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map((notice) => (
                    <div key={notice._id} className="bg-white rounded-3xl p-7 shadow-[0px_18px_40px_rgba(112,144,176,0.08)] border border-transparent hover:border-indigo-100 transition-all group flex flex-col">
                        <div className="flex items-center justify-between mb-5">
                            <span className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${getCategoryStyle(notice.category)}`}>
                                {notice.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-[#A3AED0] text-xs font-semibold">
                                <FaRegClock className="text-[10px]" />
                                {new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-[#2B3674] mb-3 group-hover:text-indigo-600 transition-colors">
                            {notice.title}
                        </h3>
                        <p className="text-[#707EAE] text-[14px] leading-relaxed font-medium mb-6 flex-1">
                            {notice.content}
                        </p>

                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold shadow-inner">
                                    {notice.postedBy?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-[#2B3674]">{notice.postedBy?.name}</span>
                                    <span className="text-[9px] font-bold text-[#A3AED0] uppercase">Admin Team</span>
                                </div>
                            </div>

                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => handleDelete(notice._id)}
                                    className="w-8 h-8 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                                    title="Delete Notice"
                                >
                                    <FaTrash size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {notices.length === 0 && !loading && (
                <div className="bg-white py-20 rounded-3xl shadow-[0px_18px_40px_rgba(112,144,176,0.05)] text-center border-2 border-dashed border-slate-100">
                    <div className="w-16 h-16 bg-[#F4F7FE] text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <FaBullhorn />
                    </div>
                    <h3 className="text-[#2B3674] font-bold text-lg">No active notices</h3>
                    <p className="text-[#A3AED0] text-sm font-medium">Important updates will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;