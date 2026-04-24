import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPrint, FaArrowLeft, FaRegBuilding, FaMinusCircle, FaPlusCircle } from 'react-icons/fa';

const SalarySlip = () => {
    const { id } = useParams();
    const [slip, setSlip] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token')?.replace(/"/g, '');

    useEffect(() => {
        const fetchSlip = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/payroll/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentSlip = res.data.find(item => item._id === id);
                setSlip(currentSlip);
            } catch (err) {
                console.error("Error fetching slip", err);
            }
        };
        fetchSlip();
    }, [id, token]);

    if (!slip) return <div className="p-10 text-center font-bold text-slate-500">Loading Salary Slip...</div>;

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Control Buttons */}
                <div className="flex justify-between mb-6 no-print">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost gap-2 text-slate-600 font-bold">
                        <FaArrowLeft /> Back
                    </button>
                    <button onClick={() => window.print()} className="btn btn-primary gap-2 text-white shadow-lg font-bold">
                        <FaPrint /> Print / Download PDF
                    </button>
                </div>

                {/* The Actual Slip Card */}
                <div className="bg-white p-10 shadow-2xl rounded-sm border-t-8 border-blue-600 relative overflow-hidden">

                    {/* Watermark */}
                    <div className="absolute top-10 right-10 opacity-5">
                        <FaRegBuilding className="text-9xl" />
                    </div>

                    {/* Company Header */}
                    <div className="text-center border-b pb-6 mb-8">
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Akota Power Land Ltd.</h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Industrial Power Solutions & HRM</p>
                        <div className="badge badge-primary mt-2 px-4 py-3 font-bold uppercase tracking-widest text-xs">Payslip: {slip.month}</div>
                    </div>

                    {/* Employee Info Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
                        <div className="space-y-3">
                            <p><span className="font-bold text-slate-400 uppercase text-[10px] block">Employee Name</span> <span className="text-lg font-black text-slate-800 uppercase">{slip.employee?.name}</span></p>
                            <p><span className="font-bold text-slate-400 uppercase text-[10px] block">Designation</span> <span className="font-bold text-slate-700">{slip.employee?.designation}</span></p>
                        </div>
                        <div className="space-y-3 text-right">
                            <p><span className="font-bold text-slate-400 uppercase text-[10px] block">Employee ID</span> <span className="font-black text-slate-800">#{slip.employee?.employeeId || 'N/A'}</span></p>
                            <p><span className="font-bold text-slate-400 uppercase text-[10px] block">Payment Status</span> <span className={`badge ${slip.status === 'Paid' ? 'badge-success' : 'badge-warning'} text-white font-black px-3`}>{slip.status}</span></p>
                        </div>
                    </div>

                    {/* Earnings & Deductions Table */}
                    <div className="border rounded-xl overflow-hidden mb-8">
                        <table className="table w-full">
                            <thead className="bg-slate-900 text-white">
                                <tr>
                                    <th className="rounded-none uppercase tracking-widest text-xs">Description</th>
                                    <th className="text-right rounded-none uppercase tracking-widest text-xs">Type</th>
                                    <th className="text-right rounded-none uppercase tracking-widest text-xs">Amount (BDT)</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                <tr>
                                    <td className="font-bold text-slate-600 italic">Basic Salary (60%)</td>
                                    <td className="text-right"><FaPlusCircle className="inline text-green-500 mr-2" />Earning</td>
                                    <td className="text-right font-mono font-bold">৳{slip.basic?.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-slate-600 italic">House Rent (30%)</td>
                                    <td className="text-right"><FaPlusCircle className="inline text-green-500 mr-2" />Earning</td>
                                    <td className="text-right font-mono font-bold">৳{slip.houseRent?.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-slate-600 italic">Allowances (Conveyance + Medical)</td>
                                    <td className="text-right"><FaPlusCircle className="inline text-green-500 mr-2" />Earning</td>
                                    <td className="text-right font-mono font-bold">৳{(slip.conveyance + slip.medical)?.toLocaleString()}</td>
                                </tr>

                                {slip.festivalBonus > 0 && (
                                    <tr className="bg-blue-50">
                                        <td className="font-black text-blue-700">Festival Bonus</td>
                                        <td className="text-right"><FaPlusCircle className="inline text-blue-500 mr-2" />Bonus</td>
                                        <td className="text-right font-mono font-bold text-blue-700">৳{slip.festivalBonus?.toLocaleString()}</td>
                                    </tr>
                                )}

                                {/* Deduction Row - Very Important */}
                                {slip.deductions > 0 && (
                                    <tr className="bg-red-50">
                                        <td className="font-black text-red-600 uppercase text-xs">Late Attendance Penalty (5:1 Rule)</td>
                                        <td className="text-right"><FaMinusCircle className="inline text-red-500 mr-2" />Deduction</td>
                                        <td className="text-right font-mono font-bold text-red-600">- ৳{slip.deductions?.toLocaleString()}</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                                <tr className="text-xl">
                                    <th colSpan="2" className="text-slate-900 font-black uppercase tracking-tighter">Total Net Payable</th>
                                    <th className="text-right text-blue-700 font-black tracking-tighter">৳{slip.netPayable?.toLocaleString()}</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Summary Section */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Salary</p>
                            <p className="text-lg font-black text-slate-700 font-mono">৳{slip.grossSalary?.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Deductions</p>
                            <p className="text-lg font-black text-red-600 font-mono">৳{slip.deductions?.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Footer / Signature Area */}
                    <div className="mt-20 flex justify-between items-end">
                        <div className="text-center">
                            <div className="w-48 border-t-2 border-slate-800 pt-2 text-[10px] font-black text-slate-800 uppercase tracking-widest">Employee Signature</div>
                        </div>
                        <div className="text-center">
                            <p className="mb-1 text-xs font-bold text-slate-500 italic">On behalf of Management</p>
                            <div className="w-48 border-t-2 border-slate-800 pt-2 text-[10px] font-black text-slate-800 uppercase tracking-widest">Authorized Signatory</div>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t text-center text-[9px] text-slate-400 italic uppercase tracking-[4px]">
                        Confidential Document - Akota Power Land Limited - {new Date().getFullYear()}
                    </div>
                </div>
            </div>

            {/* Print Specific CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .max-w-3xl { max-width: 100% !important; width: 100% !important; }
                    .shadow-2xl { shadow: none !important; box-shadow: none !important; }
                    .rounded-sm { border-radius: 0 !important; }
                    .bg-white { padding: 40px !important; }
                }
            `}} />
        </div>
    );
};

export default SalarySlip;