import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    FaBuilding, FaClock, FaPercentage, FaSave, FaCogs,
    FaCheckCircle, FaGlobe, FaMapMarkerAlt, FaExclamationTriangle
} from 'react-icons/fa';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('company');
    const [settings, setSettings] = useState({
        companyName: '',
        companyAddress: '',
        officeStartTime: '09:00',
        graceTime: 15,
        lateDaysForDeduction: 3,
        basicPercent: 60,
        houseRentPercent: 30,
        conveyancePercent: 5,
        medicalPercent: 5
    });
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');

    // টোকেন এবং কনফিগ মেমোরাইজ করা হচ্ছে যাতে অপ্রয়োজনীয় রি-রেন্ডার না হয়
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }), []);

    const API_URL = 'http://localhost:5000/api/settings';

    // ১. ব্যাকএন্ড থেকে সেটিংস লোড করা
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(API_URL, config);
                // আমাদের কন্ট্রোলার যেহেতু { success: true, data: {...} } ফরম্যাটে ডাটা পাঠায়
                if (res.data && res.data.data) {
                    setSettings(res.data.data);
                }
            } catch (err) {
                console.error("Settings load failed:", err);
                setError("Could not load settings from server.");
            }
        };
        fetchSettings();
    }, [config]);

    // ২. আপডেট হ্যান্ডলার
    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        // পার্সেন্টেজ ভ্যালিডেশন
        const total =
            Number(settings.basicPercent) +
            Number(settings.houseRentPercent) +
            Number(settings.conveyancePercent) +
            Number(settings.medicalPercent);

        if (total !== 100) {
            setError(`Salary breakdown total must be 100%. Current total: ${total}%`);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(API_URL, settings, config);

            if (res.data.success) {
                setSettings(res.data.data); // লেটেস্ট ডাটা স্টেট আপডেট
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Update Error:", err.response?.data);
            setError(err.response?.data?.message || "Update Failed! Please check server connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-4 md:p-10 font-sans text-slate-700 text-left">
            <div className="max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-2xl shadow-indigo-200">
                            <FaCogs className="text-3xl text-white animate-[spin_10s_linear_infinite]" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Configuration</h2>
                            <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[2px]">Global rules and payroll logic for Akota Power</p>
                        </div>
                    </div>

                    {saveSuccess && (
                        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl font-bold border border-emerald-100 shadow-sm animate-bounce">
                            <FaCheckCircle className="text-xl" /> Settings synchronization complete!
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 text-red-700 px-6 py-4 rounded-2xl font-bold border border-red-100 shadow-sm">
                            <FaExclamationTriangle className="text-xl" /> {error}
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left Navigation */}
                    <div className="w-full lg:w-80 space-y-4">
                        {[
                            { id: 'company', label: 'Organization', sub: 'Profile & Identity', icon: <FaBuilding /> },
                            { id: 'attendance', label: 'Attendance', sub: 'Work hours & Policy', icon: <FaClock /> },
                            { id: 'payroll', label: 'Financial Logic', sub: 'Salary distributions', icon: <FaPercentage /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full group text-left p-5 rounded-3xl transition-all duration-500 border-2 ${activeTab === tab.id
                                    ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-100 translate-x-2'
                                    : 'bg-transparent border-transparent hover:bg-white/50 hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                        {tab.icon}
                                    </div>
                                    <div>
                                        <p className={`font-black text-lg ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>{tab.label}</p>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{tab.sub}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-12">
                        <form onSubmit={handleUpdate} className="space-y-12">

                            {activeTab === 'company' && (
                                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                                    <div className="flex items-center gap-4 border-b border-slate-100 pb-6 text-2xl font-black text-slate-800">
                                        Corporate Profile
                                    </div>
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="group space-y-2 text-left">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                                                <FaGlobe className="inline mr-2 text-indigo-500" /> Legal Entity Name
                                            </label>
                                            <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-lg" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} placeholder="e.g. Akota Power Land Ltd." />
                                        </div>
                                        <div className="group space-y-2 text-left">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                                                <FaMapMarkerAlt className="inline mr-2 text-indigo-500" /> Registered Office Address
                                            </label>
                                            <textarea className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold min-h-[120px]" value={settings.companyAddress} onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })} placeholder="Enter full address here..." />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'attendance' && (
                                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                                    <div className="flex items-center gap-4 border-b border-slate-100 pb-6 text-2xl font-black text-slate-800">
                                        Punctuality Policy
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2 text-left">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Shift Start Time</label>
                                            <input type="time" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-black text-xl text-indigo-600" value={settings.officeStartTime} onChange={(e) => setSettings({ ...settings, officeStartTime: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Grace Period (Minutes)</label>
                                            <input type="number" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-black text-xl" value={settings.graceTime} onChange={(e) => setSettings({ ...settings, graceTime: e.target.value })} />
                                        </div>
                                        <div className="md:col-span-2 bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-[2rem] border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="text-left">
                                                <p className="text-orange-900 font-black text-lg uppercase tracking-tighter">Late Entry Penalty</p>
                                                <p className="text-orange-600 font-bold text-xs uppercase tracking-wider">Deduct 1-day basic salary for every:</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="number" className="w-24 bg-white border-2 border-orange-200 p-4 rounded-xl text-center font-black text-2xl text-orange-600 outline-none shadow-sm" value={settings.lateDaysForDeduction} onChange={(e) => setSettings({ ...settings, lateDaysForDeduction: e.target.value })} />
                                                <span className="font-black text-orange-900 uppercase text-xs tracking-widest">Late Days</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payroll' && (
                                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8 text-left">
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                                        <div className="text-2xl font-black text-slate-800">Financial Breakdown</div>
                                        <div className="text-[10px] font-black bg-indigo-600 text-white px-4 py-2 rounded-full tracking-widest uppercase shadow-lg shadow-indigo-100">Total 100%</div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { key: 'basicPercent', label: 'Basic Salary' },
                                            { key: 'houseRentPercent', label: 'House Rent' },
                                            { key: 'conveyancePercent', label: 'Conveyance' },
                                            { key: 'medicalPercent', label: 'Medical' }
                                        ].map((item) => (
                                            <div key={item.key} className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-50 hover:border-indigo-100 transition-all group">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{item.label}</label>
                                                <div className="flex items-center gap-3">
                                                    <input type="number" className="w-full bg-transparent font-black text-3xl text-indigo-600 outline-none" value={settings[item.key]} onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })} />
                                                    <span className="text-2xl font-bold text-slate-300 group-hover:text-indigo-300">%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button type="submit" className={`group relative w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-lg tracking-widest overflow-hidden transition-all hover:bg-indigo-600 active:scale-[0.98] shadow-2xl shadow-indigo-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={loading}>
                                <div className="absolute inset-0 w-0 bg-indigo-600 transition-all duration-500 group-hover:w-full"></div>
                                <span className="relative flex items-center justify-center gap-3 uppercase tracking-[3px]">
                                    <FaSave className="text-xl" /> {loading ? 'Synchronizing...' : 'Commit Changes'}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
                <p className="text-center mt-12 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Akota Power Limited • Secure HRM Infrastructure v2.0</p>
            </div>
        </div>
    );
};

export default Settings;