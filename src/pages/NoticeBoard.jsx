import React, { useState, useEffect, useContext } from 'react';
import API from '../api'; // কাস্টম API ইন্টারসেপ্টর ইম্পোর্ট
import { AuthContext } from '../context/AuthContext';
import {
    FaBullhorn, FaTrash, FaPlus, FaRegClock,
    FaLayerGroup
} from 'react-icons/fa';

const NoticeBoard = () => {
    const { user } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'General' });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await API.get('/api/notices/all');
            setNotices(res.data);
        } catch (err) {
            console.error("Error fetching notices", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await API.post('/api/notices/create', formData);
            setFormData({ title: '', content: '', category: 'General' });
            setShowForm(false);
            fetchNotices(); // নতুন নোটিশ আসার পর লিস্ট রিফ্রেশ
        } catch (err) {
            alert("Failed to post notice: " + (err.response?.data?.message || "Server Error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this notice?")) {
            try {
                await API.delete(`/api/notices/${id}`);
                setNotices(notices.filter(notice => notice._id !== id)); // রিফ্রেশ ছাড়াই স্টেট থেকে রিমুভ
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
        <div className="h-96 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-[#A3AED0] font-bold text-[10px] uppercase tracking-widest">Loading Bulletins...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 text-left">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#2B3674] uppercase tracking-tight leading-none">Notice Board</h2>
                    <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Company Announcements & Updates</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-[0_10px_20px_rgba(67,24,255,0.2)] hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        {showForm ? 'Close Form' : <><FaPlus className="text-xs" /> Create Announcement</>}
                    </button>
                )}
            </div>

            {/* Admin Post Form */}
            {showForm && (
                <div className="bg-white rounded-3xl shadow-[0px_18px_40px_rgba(112,144,176,0.12)] p-8 border border-indigo-50 animate-in slide-in-from-top-5 duration-500">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#2B3674] ml-1">Notice Title</label>
                                <input
                                    required
                                    className="w-full mt-2 px-5 py-3.5 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-[#2B3674] font-bold transition-all"
                                    placeholder="e.g. Eid-ul-Fitr Holiday Announcement"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#2B3674] ml-1">Priority Category</label>
                                <select
                                    className="w-full mt-2 px-5 py-3.5 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-[#2B3674] font-bold cursor-pointer"
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
                            <label className="text-[11px] font-black uppercase tracking-widest text-[#2B3674] ml-1">Detailed Content</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full mt-2 px-5 py-3.5 bg-[#F4F7FE] border-none rounded-3xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-[#2B3674] font-medium transition-all resize-none leading-relaxed"
                                placeholder="Provide clear details about the announcement..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button
                                disabled={isSubmitting}
                                className="bg-[#2B3674] text-white px-10 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#1B2559] transition-all shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? "Publishing..." : "Publish Bulletin"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notices Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {notices.map((notice) => (
                    <div key={notice._id} className="bg-white rounded-[2rem] p-7 shadow-[0px_18px_40px_rgba(112,144,176,0.06)] border border-slate-50 hover:border-indigo-100 transition-all group flex flex-col relative overflow-hidden">

                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[2px] border ${getCategoryStyle(notice.category)}`}>
                                {notice.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-[#A3AED0] text-[10px] font-black uppercase tracking-widest">
                                <FaRegClock className="text-indigo-400" />
                                {new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-[#2B3674] mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                            {notice.title}
                        </h3>
                        <p className="text-[#707EAE] text-sm leading-relaxed font-medium mb-8 flex-1 whitespace-pre-line">
                            {notice.content}
                        </p>

                        <div className="flex items-center justify-between pt-5 border-t border-slate-50 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-black shadow-inner border border-indigo-100 uppercase">
                                    {notice.postedBy?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-[#2B3674] uppercase tracking-tight">{notice.postedBy?.name || 'Administrator'}</span>
                                    <span className="text-[9px] font-bold text-[#A3AED0] uppercase tracking-widest">Corporate Office</span>
                                </div>
                            </div>

                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => handleDelete(notice._id)}
                                    className="w-9 h-9 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
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
                <div className="bg-white py-24 rounded-[3rem] shadow-[0px_18px_40px_rgba(112,144,176,0.05)] text-center border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-[#F4F7FE] text-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        <FaBullhorn />
                    </div>
                    <h3 className="text-[#2B3674] font-black text-xl uppercase tracking-tight">No active bulletins</h3>
                    <p className="text-[#A3AED0] text-xs font-bold uppercase tracking-[3px] mt-2">Important updates will appear here</p>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;