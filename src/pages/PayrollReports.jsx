import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSearch, FaClock, FaCreditCard, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const PayrollReports = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    // --- ডাইনামিক ইউআরএল সেটআপ ---
    const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

    // অ্যাথেন্টিকেশন কনফিগ (মেমোরাইজড)
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token')?.replace(/['"]+/g, '').trim();
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    }, []);

    const fetchPayrollHistory = useCallback(async () => {
        setLoading(true);
        try {
            const config = getAuthHeaders();
            const res = await axios.get(`${API_BASE_URL}/payroll/history`, config);

            // ডাটা ফরম্যাট চেক করে সেট করা
            const data = res.data.data || res.data;
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("🔥 History Fetch Error:", err);
            setStatusMsg({ type: 'error', text: "Could not load financial history." });
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, API_BASE_URL]);

    useEffect(() => {
        fetchPayrollHistory();
    }, [fetchPayrollHistory]);

    // পেমেন্ট স্ট্যাটাস আপডেট লজিক
    const handlePayment = async (id) => {
        if (!window.confirm("Confirm salary disbursement for this record?")) return;

        try {
            const config = getAuthHeaders();
            const res = await axios.patch(`${API_BASE_URL}/payroll/status/${id}`, { status: 'Paid' }, config);

            if (res.data.success || res.data) {
                setHistory(prev => prev.map(item => item._id === id ? { ...item, status: 'Paid' } : item));
                setStatusMsg({ type: 'success', text: "Payment confirmed successfully!" });
            }
        } catch (err) {
            console.error("🔥 Payment Error:", err);
            const msg = err.response?.data?.message || "Failed to process payment.";
            setStatusMsg({ type: 'error', text: msg });
        } finally {
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
        }
    };

    // উন্নত সার্চ ফিল্টার (সেফটি চেক সহ)
    const filteredHistory = history.filter(record => {
        const name = record.employee?.name?.toLowerCase() || '';
        const empId = record.employee?.employeeId?.toLowerCase() || '';
        const month = record.month?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        return name.includes(search) || empId.includes(search) || month.includes(search);
    });

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FD]">
            <div className="w-12 h-1 bg-blue-600 animate-bounce rounded-full mb-4"></div>
            <div className="animate-pulse text-slate-400 font-black text-[10px] uppercase tracking-[4px]">
                Syncing Ledger Data...
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-left animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-4xl font-[1000] text-slate-900 tracking-tighter uppercase leading-none">Payroll Reports</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[4px] italic">Internal Records • Financial Ledger</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Name, ID or Month..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-72 shadow-inner"
                        />
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {statusMsg.text && (
                <div className={`flex items-center gap-4 p-6 rounded-3xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl animate-in slide-in-from-top-4 duration-500 ${statusMsg.type === 'success' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-rose-500 shadow-rose-100'}`}>
                    {statusMsg.type === 'success' ? <FaCheckCircle size={18} /> : <FaExclamationTriangle size={18} />}
                    {statusMsg.text}
                </div>
            )}

            {/* Reports Table Container */}
            <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-900 text-white/90">
                            <tr>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-left">Staff Member</th>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-center">Billing Period</th>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-center">Gross Salary</th>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-center">Net Payable</th>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-right">Payment Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((record) => (
                                    <tr key={record._id} className="hover:bg-blue-50/30 transition-all group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {record.employee?.name?.substring(0, 2).toUpperCase() || '??'}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-sm tracking-tight uppercase">{record.employee?.name || 'Unknown'}</div>
                                                    <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{record.employee?.employeeId || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-black text-[10px] text-slate-600 uppercase border border-slate-100">
                                                <FaClock className="text-blue-500" /> {record.month || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Gross</div>
                                            <div className="font-bold text-slate-600 text-sm">৳{record.grossSalary?.toLocaleString() || 0}</div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="text-[10px] font-black text-blue-400 uppercase mb-1">Final Disburse</div>
                                            <div className="font-[1000] text-slate-900 text-lg tracking-tighter">৳{record.netPayable?.toLocaleString() || 0}</div>
                                        </td>
                                        <td className="p-8 text-right">
                                            {record.status === 'Paid' ? (
                                                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black text-[9px] uppercase tracking-widest">
                                                    <FaCheckCircle /> Disbursed
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handlePayment(record._id)}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[9px] uppercase tracking-[2px] transition-all active:scale-95 shadow-lg shadow-blue-100"
                                                >
                                                    <FaCreditCard /> Disburse Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <div className="text-slate-300 font-black text-[11px] uppercase tracking-[5px] opacity-40 italic">Audit Log: No Matches Found</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="pt-10 pb-12 text-center">
                <div className="inline-block px-6 py-2 bg-slate-900 rounded-full">
                    <p className="text-white font-black text-[8px] uppercase tracking-[6px]">
                        Internal Financial Control Systems
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PayrollReports;