import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHistory, FaDownload, FaSearch, FaCheckCircle, FaClock, FaUserTie, FaCreditCard } from 'react-icons/fa';

const PayrollReports = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchPayrollHistory();
    }, []);

    const fetchPayrollHistory = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/payroll/history', config);
            setHistory(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch history", err);
            setLoading(false);
        }
    };

    // পেমেন্ট স্ট্যাটাস আপডেট করার ফাংশন (সংশোধিত)
    const handlePayment = async (id) => {
        if (!window.confirm("Mark this salary as disbursed?")) return;
        try {
            // মেথড পরিবর্তন: .put থেকে .patch করা হলো (আপনার রাউট অনুযায়ী)
            // URL পরিবর্তন: /pay/${id} থেকে /status/${id} করা হলো
            const res = await axios.patch(`http://localhost:5000/api/payroll/status/${id}`, { status: 'Paid' }, config);

            if (res.data.success) {
                // লোকাল স্টেট আপডেট করা যাতে রিফ্রেশ ছাড়াই দেখা যায়
                setHistory(history.map(item => item._id === id ? { ...item, status: 'Paid' } : item));
                alert("Payment successful!");
            }
        } catch (err) {
            console.error("Payment Error:", err.response?.data || err.message);
            alert("Failed to process payment. Please check console for details.");
        }
    };

    // সার্চ ফিল্টার
    const filteredHistory = history.filter(record =>
        record.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.month?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="animate-pulse text-slate-400 font-black text-[10px] uppercase tracking-[4px]">Loading Financial Records...</div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-700 text-left">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-[1000] text-slate-900 tracking-tighter uppercase leading-none">Payroll Reports</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest italic">Historical Disbursement Data</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Name or Month..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm font-bold text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900 text-white">
                            <tr>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-left">Staff Member</th>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-center">Period</th>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-center">Gross</th>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-center">Deduction</th>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-center">Net Payable</th>
                                <th className="p-8 text-[9px] font-black uppercase tracking-[3px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredHistory.map((record) => (
                                <tr key={record._id} className="hover:bg-slate-50 transition-all">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs uppercase">
                                                {record.employee?.name?.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-sm tracking-tight uppercase">{record.employee?.name}</div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{record.employee?.employeeId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl font-black text-[10px] text-slate-600 uppercase">
                                            <FaClock className="text-blue-500" /> {record.month}
                                        </div>
                                    </td>
                                    <td className="p-8 text-center font-bold text-slate-400 text-sm">৳{record.grossSalary?.toLocaleString()}</td>
                                    <td className="p-8 text-center font-bold text-red-500 text-sm">-৳{record.deductions?.toLocaleString()}</td>
                                    <td className="p-8 text-center font-black text-slate-900 text-lg tracking-tighter">৳{record.netPayable?.toLocaleString()}</td>
                                    <td className="p-8 text-right">
                                        {record.status === 'Paid' ? (
                                            <span className="px-5 py-2 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl font-black text-[9px] uppercase tracking-widest">
                                                Disbursed
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handlePayment(record._id)}
                                                className="flex items-center gap-2 ml-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-blue-200"
                                            >
                                                <FaCreditCard /> Pay Now
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredHistory.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="text-slate-300 font-black text-[10px] uppercase tracking-[5px]">No records found for this criteria</div>
                    </div>
                )}
            </div>

            <div className="pt-10 pb-20 text-center">
                <p className="text-slate-300 font-black text-[10px] uppercase tracking-[8px] opacity-50">
                    Proprietary Archive • Akota Power HRM v2.0
                </p>
            </div>
        </div>
    );
};

export default PayrollReports;