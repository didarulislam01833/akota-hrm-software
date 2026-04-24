import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    FaMoneyCheckAlt, FaCheckCircle, FaExclamationTriangle,
    FaCalendarAlt, FaWallet, FaArrowRight, FaSearch
} from 'react-icons/fa';

const Payroll = () => {
    const [employees, setEmployees] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(`${new Date().toLocaleString('default', { month: 'long' })} ${currentYear}`);

    const API_BASE_URL = 'http://localhost:5000/api';

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const cleanToken = token.replace(/['"]+/g, '').trim();
        return {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json'
        };
    }, []);

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) {
            setStatusMsg({ type: 'error', text: "Authentication token missing." });
            return;
        }

        setLoading(true);
        try {
            const [empRes, setRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/employees`, { headers }),
                axios.get(`${API_BASE_URL}/settings`, { headers }).catch(() => ({ data: null }))
            ]);
            setEmployees(empRes.data || []);
            setSettings(setRes.data || null);
        } catch (err) {
            setStatusMsg({ type: 'error', text: "Failed to load financial records." });
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerate = async (empId) => {
        const headers = getAuthHeaders();
        if (!headers) return;

        setLoading(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const response = await axios.post(
                `${API_BASE_URL}/payroll/generate`,
                { employeeId: empId, month: selectedMonth },
                { headers }
            );

            if (response.data.success) {
                setStatusMsg({
                    type: 'success',
                    text: response.data.message || "Salary slip generated successfully!"
                });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Internal system error.";
            setStatusMsg({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
        }
    };

    if (loading && employees.length === 0) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FD]">
            <div className="w-16 h-1 bg-indigo-600 animate-bounce rounded-full mb-4"></div>
            <div className="animate-pulse text-[#A3AED0] font-black text-[10px] uppercase tracking-[4px]">
                Securing Financial Access...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-10 font-sans text-left">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                <FaWallet size={20} />
                            </div>
                            <h1 className="text-3xl font-black text-[#2B3674] tracking-tight uppercase">Payroll Center</h1>
                        </div>
                        <p className="text-[#A3AED0] font-bold uppercase text-[10px] tracking-[3px] italic ml-1">
                            System: {settings?.companyName || 'Mission Power Land Ltd.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 transition-transform group-hover:scale-110" />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="pl-12 pr-10 py-4 bg-[#F4F7FE] border-none rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer text-[#2B3674] appearance-none focus:ring-2 ring-indigo-100 transition-all shadow-inner"
                            >
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                    <option key={m} value={`${m} ${currentYear}`}>{m} {currentYear}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Status Message */}
                {statusMsg.text && (
                    <div className={`flex items-center gap-4 p-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-white shadow-xl animate-in slide-in-from-top duration-500 ${statusMsg.type === 'success' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'}`}>
                        {statusMsg.type === 'success' ? <FaCheckCircle size={18} /> : <FaExclamationTriangle size={18} />}
                        {statusMsg.text}
                    </div>
                )}

                {/* Main Content Table */}
                <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 w-full md:w-80 shadow-sm">
                            <FaSearch className="text-[#A3AED0] text-xs" />
                            <input type="text" placeholder="Search for staff..." className="bg-transparent border-none outline-none text-[10px] font-black text-[#2B3674] w-full uppercase tracking-widest" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="px-8 py-6 text-[#A3AED0] font-black uppercase text-[9px] tracking-[3px] border-b border-slate-50">Personnel Identity</th>
                                    <th className="px-8 py-6 text-[#A3AED0] font-black uppercase text-[9px] tracking-[3px] border-b border-slate-50">Standard Base Salary</th>
                                    <th className="px-8 py-6 text-[#A3AED0] font-black uppercase text-[9px] tracking-[3px] text-right border-b border-slate-50">Execution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {employees.length > 0 ? (
                                    employees.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-[#F4F7FE]/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-[#2B3674] text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:bg-indigo-600 transition-all transform group-hover:rotate-3">
                                                        {emp.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-[#2B3674] text-md uppercase leading-none mb-1">{emp.name}</div>
                                                        <div className="text-[9px] font-black text-indigo-500 uppercase tracking-[2px]">{emp.designation || 'Specialist Staff'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-black text-[#2B3674] text-xl tracking-tighter">
                                                <span className="text-xs mr-1 text-[#A3AED0]">BDT</span>
                                                {(emp.basicSalary || 0).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => handleGenerate(emp._id)}
                                                    disabled={loading}
                                                    className={`group/btn relative overflow-hidden bg-[#2B3674] text-white px-8 py-4 rounded-2xl font-black text-[9px] uppercase tracking-[2px] shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {loading ? 'Processing System...' : 'Generate Pay Slip'}
                                                        {!loading && <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />}
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="py-32 text-center">
                                            <div className="text-[#A3AED0] font-black text-[11px] uppercase tracking-[5px] opacity-40">Financial Records Not Found</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payroll;