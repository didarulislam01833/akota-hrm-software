import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPrint, FaArrowLeft, FaRegBuilding, FaMinusCircle, FaPlusCircle, FaFileInvoiceDollar } from 'react-icons/fa';

const SalarySlip = () => {
    const { id } = useParams();
    const [slip, setSlip] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSlip = async () => {
            try {
                const token = localStorage.getItem('token')?.replace(/['"]+/g, '');
                // সরাসরি নির্দিষ্ট আইডি দিয়ে কল করা বেস্ট প্র্যাকটিস
                const res = await axios.get(`http://localhost:5000/api/payroll/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentSlip = res.data.find(item => item._id === id);
                setSlip(currentSlip);
            } catch (err) {
                console.error("Error fetching slip:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlip();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Generating Secure Slip...</p>
            </div>
        </div>
    );

    if (!slip) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-slate-50">
            <div className="text-rose-500 font-black text-xl mb-4">DATA NOT FOUND</div>
            <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                <FaArrowLeft /> Return to Records
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-200/50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Control Toolbar */}
                <div className="flex justify-between items-center mb-8 no-print animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-900 hover:text-white rounded-2xl shadow-sm transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        <FaArrowLeft /> Back to List
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest"
                    >
                        <FaPrint size={14} /> Download Payslip (PDF)
                    </button>
                </div>

                {/* The Payslip Card */}
                <div id="payslip-area" className="bg-white p-12 shadow-[0_30px_100px_rgba(0,0,0,0.05)] rounded-sm border-t-[12px] border-slate-900 relative">

                    {/* Floating Watermark */}
                    <div className="absolute top-20 right-10 opacity-[0.03] select-none pointer-events-none">
                        <FaFileInvoiceDollar className="text-[250px]" />
                    </div>

                    {/* Header Section */}
                    <div className="flex flex-col items-center border-b-[3px] border-slate-900 pb-8 mb-10">
                        <div className="bg-slate-900 text-white px-4 py-1 mb-4 text-[10px] font-black uppercase tracking-[5px]">Official Document</div>
                        <h2 className="text-4xl font-[1000] text-slate-900 uppercase tracking-tighter leading-none">Akota Power Land Ltd.</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[6px] mt-2">Premium Industrial Solutions & HRM</p>
                    </div>

                    {/* Identity Grid */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Employee Recipient</label>
                                <p className="text-xl font-black text-slate-900 uppercase leading-none">{slip.employee?.name || '---'}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Position / Grade</label>
                                <p className="font-black text-slate-600 text-xs uppercase tracking-wider">{slip.employee?.designation || 'Staff Member'}</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payslip ID / Period</label>
                                <p className="font-black text-slate-900 text-xs uppercase tracking-tighter">#{slip._id?.slice(-8).toUpperCase()} / {slip.month}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Disbursement Status</label>
                                <span className={`inline-block px-3 py-1 rounded-md font-black text-[9px] uppercase tracking-widest ${slip.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {slip.status || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Calculation Table */}
                    <div className="border-[2px] border-slate-900 rounded-lg overflow-hidden mb-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest">Description</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Type</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">Total (BDT)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-bold text-slate-700 text-sm italic">Basic Salary (60% Base)</td>
                                    <td className="p-5 text-center"><span className="text-[9px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter">Credit (+)</span></td>
                                    <td className="p-5 text-right font-mono font-black text-slate-900">৳{slip.basic?.toLocaleString()}</td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-bold text-slate-700 text-sm italic">House Rent (30% Base)</td>
                                    <td className="p-5 text-center"><span className="text-[9px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter">Credit (+)</span></td>
                                    <td className="p-5 text-right font-mono font-black text-slate-900">৳{slip.houseRent?.toLocaleString()}</td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-bold text-slate-700 text-sm italic">Medical & Conveyance Allowance</td>
                                    <td className="p-5 text-center"><span className="text-[9px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter">Credit (+)</span></td>
                                    <td className="p-5 text-right font-mono font-black text-slate-900">৳{(Number(slip.medical || 0) + Number(slip.conveyance || 0)).toLocaleString()}</td>
                                </tr>

                                {slip.festivalBonus > 0 && (
                                    <tr className="bg-blue-50/50">
                                        <td className="p-5 font-black text-blue-700 text-sm">FESTIVAL BONUS</td>
                                        <td className="p-5 text-center"><span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter">Bonus (+)</span></td>
                                        <td className="p-5 text-right font-mono font-black text-blue-700">৳{slip.festivalBonus?.toLocaleString()}</td>
                                    </tr>
                                )}

                                {slip.deductions > 0 && (
                                    <tr className="bg-rose-50/50">
                                        <td className="p-5 font-black text-rose-700 text-sm uppercase tracking-tight">Late Attendance (5:1 Rule Penalty)</td>
                                        <td className="p-5 text-center"><span className="text-[9px] bg-rose-100 text-rose-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter">Debit (-)</span></td>
                                        <td className="p-5 text-right font-mono font-black text-rose-700">- ৳{slip.deductions?.toLocaleString()}</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50 border-t-[3px] border-slate-900">
                                    <td colSpan="2" className="p-6 text-xl font-[1000] text-slate-900 uppercase tracking-tighter">Final Net Payable</td>
                                    <td className="p-6 text-right text-2xl font-[1000] text-blue-700 tracking-tighter">৳{slip.netPayable?.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Bottom Signature Space */}
                    <div className="mt-24 grid grid-cols-2 gap-32">
                        <div className="text-center">
                            <div className="h-1 bg-slate-200 mb-2"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Recipients Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="h-[2px] bg-slate-900 mb-2"></div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[4px]">Authorized Seal</p>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-dashed border-slate-200 text-center">
                        <p className="text-[9px] font-bold text-slate-400 italic uppercase tracking-[5px]">
                            Generated Securely by Akota Power Land HRM • Version 2.4.0
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    #payslip-area { 
                        box-shadow: none !important; 
                        border: 1px solid #eee !important;
                        padding: 30px !important; 
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
};

export default SalarySlip;