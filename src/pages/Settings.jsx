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

    // ১. ডাইনামিক API ইউআরএল (.env থেকে আসবে)
    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/settings`;

    // ২. স্যালারি ব্রেকডাউন ক্যালকুলেশন (রিয়েল-টাইম)
    const currentTotalPercent = useMemo(() => {
        return (
            Number(settings.basicPercent || 0) +
            Number(settings.houseRentPercent || 0) +
            Number(settings.conveyancePercent || 0) +
            Number(settings.medicalPercent || 0)
        );
    }, [settings]);

    // ৩. সেটিংস ফেচ করা
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('token')?.replace(/['"]+/g, '');
                const res = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // ব্যাকএন্ড যদি সরাসরি ডাটা পাঠায় অথবা success অবজেক্টে পাঠায়
                const fetchedData = res.data?.data || res.data;
                if (fetchedData) {
                    setSettings(prev => ({ ...prev, ...fetchedData }));
                }
            } catch (err) {
                console.error("Settings load failed:", err);
                setError("Could not sync with server. Check connection.");
            }
        };
        fetchSettings();
    }, [API_URL]);

    // ৪. চেঞ্জ হ্যান্ডলার
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }));
    };

    // ৫. আপডেট হ্যান্ডলার
    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        if (currentTotalPercent !== 100) {
            setError(`Critical: Total breakdown must be 100%. Currently it's ${currentTotalPercent}%`);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token')?.replace(/['"]+/g, '');
            const res = await axios.post(API_URL, settings, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success || res.status === 200) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Cloud synchronization failed!");
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
                            <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[2px]">Admin Rules & Payroll Logic</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {saveSuccess && (
                            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl font-bold border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-300">
                                <FaCheckCircle className="text-xl" /> Settings synchronized!
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 text-red-700 px-6 py-4 rounded-2xl font-bold border border-red-100 shadow-sm animate-in shake duration-300">
                                <FaExclamationTriangle className="text-xl" /> {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Navigation Sidebar */}
                    <div className="w-full lg:w-80 space-y-4">
                        {[
                            { id: 'company', label: 'Organization', sub: 'Profile & Identity', icon: <FaBuilding /> },
                            { id: 'attendance', label: 'Attendance', sub: 'Work hours & Policy', icon: <FaClock /> },
                            { id: 'payroll', label: 'Financial Logic', sub: 'Salary distributions', icon: <FaPercentage /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full group text-left p-5 rounded-3xl transition-all duration-300 border-2 ${activeTab === tab.id
                                    ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100 translate-x-2'
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

                    {/* Main Settings Card */}
                    <div className="flex-1 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-12">
                        <form onSubmit={handleUpdate} className="space-y-12 text-left">

                            {activeTab === 'company' && (
                                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                                    <div className="border-b border-slate-100 pb-6 text-2xl font-black text-slate-800">Corporate Profile</div>
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="group space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Legal Entity Name</label>
                                            <div className="relative">
                                                <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                                <input name="companyName" type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-lg" value={settings.companyName} onChange={handleChange} placeholder="e.g. Akota Power Land Ltd." />
                                            </div>
                                        </div>
                                        <div className="group space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Registered Office Address</label>
                                            <textarea name="companyAddress" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold min-h-[120px]" value={settings.companyAddress} onChange={handleChange} placeholder="Full address..." />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'attendance' && (
                                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                                    <div className="border-b border-slate-100 pb-6 text-2xl font-black text-slate-800">Punctuality Policy</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Office Start Time</label>
                                            <input name="officeStartTime" type="time" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-black text-xl text-indigo-600" value={settings.officeStartTime} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Grace Period (Minutes)</label>
                                            <input name="graceTime" type="number" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-black text-xl" value={settings.graceTime} onChange={handleChange} />
                                        </div>
                                        <div className="md:col-span-2 bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-[2rem] border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div>
                                                <p className="text-orange-900 font-black text-lg uppercase tracking-tighter">Late Entry Penalty</p>
                                                <p className="text-orange-600 font-bold text-xs uppercase tracking-wider">Deduct 1-day basic salary for every:</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input name="lateDaysForDeduction" type="number" className="w-24 bg-white border-2 border-orange-200 p-4 rounded-xl text-center font-black text-2xl text-orange-600 outline-none shadow-sm" value={settings.lateDaysForDeduction} onChange={handleChange} />
                                                <span className="font-black text-orange-900 uppercase text-xs tracking-widest">Late Days</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payroll' && (
                                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                                        <div className="text-2xl font-black text-slate-800">Financial Breakdown</div>
                                        <div className={`text-[10px] font-black px-4 py-2 rounded-full tracking-widest uppercase shadow-lg transition-all ${currentTotalPercent === 100 ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white animate-pulse'}`}>
                                            Current Total: {currentTotalPercent}%
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { name: 'basicPercent', label: 'Basic Salary' },
                                            { name: 'houseRentPercent', label: 'House Rent' },
                                            { name: 'conveyancePercent', label: 'Conveyance' },
                                            { name: 'medicalPercent', label: 'Medical' }
                                        ].map((item) => (
                                            <div key={item.name} className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-50 hover:border-indigo-100 transition-all group">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{item.label}</label>
                                                <div className="flex items-center gap-3">
                                                    <input name={item.name} type="number" className="w-full bg-transparent font-black text-3xl text-indigo-600 outline-none" value={settings[item.name]} onChange={handleChange} />
                                                    <span className="text-2xl font-bold text-slate-300 group-hover:text-indigo-300">%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || (activeTab === 'payroll' && currentTotalPercent !== 100)}
                                className={`group relative w-full h-16 rounded-2xl font-black text-lg tracking-widest overflow-hidden transition-all shadow-2xl active:scale-[0.98] ${(activeTab === 'payroll' && currentTotalPercent !== 100)
                                    ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100'
                                    }`}
                            >
                                <span className="relative flex items-center justify-center gap-3 uppercase tracking-[3px]">
                                    <FaSave className="text-xl" /> {loading ? 'Synchronizing...' : 'Commit Changes'}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;