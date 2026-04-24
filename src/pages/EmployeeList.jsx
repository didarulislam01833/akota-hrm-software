import React, { useState, useEffect, useCallback } from 'react'; // useCallback যোগ করা হয়েছে
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaUserPlus, FaSearch, FaPhoneAlt, FaTrash,
    FaUserCircle, FaBuilding, FaSpinner, FaChevronRight
} from 'react-icons/fa';

const EmployeeList = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // ১. অথরাইজেশন হেডার পাওয়ার ফাংশন (দিদারুল ভাই, এটাই মিসিং ছিল)
    const getAuthHeaders = useCallback(() => {
        let token = localStorage.getItem('token');
        if (token) {
            token = token.replace(/['"]+/g, '').trim(); // কোটেশন ক্লিয়ার করা
        }
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const config = getAuthHeaders(); // হেডার কনফিগ নেওয়া হলো
            const res = await axios.get('http://localhost:5000/api/employees', config);
            setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Data Loading Error:", err.response?.status, err.response?.data);
            // যদি টোকেন ইনভ্যালিড হয় তবেই রিডাইরেক্ট করবে
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const deleteEmployee = async (id) => {
        if (window.confirm("আপনি কি নিশ্চিত যে এই এমপ্লয়িকে ডিলিট করতে চান?")) {
            try {
                const config = getAuthHeaders();
                await axios.delete(`http://localhost:5000/api/employees/${id}`, config);
                setEmployees(employees.filter(emp => emp._id !== id));
            } catch (err) {
                alert("Failed to delete employee!");
            }
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const term = search.toLowerCase();
        return (
            emp.name?.toLowerCase().includes(term) ||
            emp.employeeId?.toLowerCase().includes(term) ||
            emp.phone?.includes(term) ||
            emp.department?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#2B3674] tracking-tight">Employee Directory</h2>
                    <p className="text-[#A3AED0] text-xs font-bold uppercase tracking-wider mt-0.5">
                        {loading ? "Syncing Database..." : `${filteredEmployees.length} Total Active Members`}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/add')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                    <FaUserPlus size={14} /> Add New
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] text-sm" />
                <input
                    type="text"
                    placeholder="Search name, ID, or department..."
                    className="w-full h-11 pl-11 pr-4 bg-white rounded-xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium text-[#2B3674]"
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <FaSpinner className="animate-spin text-indigo-600" size={32} />
                    <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-widest">Loading Records...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredEmployees.map((emp) => (
                        <div key={emp._id} className="bg-white border border-slate-50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-4 text-left">
                                <div className="w-14 h-14 rounded-xl bg-[#F4F7FE] overflow-hidden border border-slate-100 shadow-sm">
                                    {emp.profilePicPath ? (
                                        <img
                                            src={`http://localhost:5000/${emp.profilePicPath.replace(/\\/g, '/')}`}
                                            className="w-full h-full object-cover"
                                            alt={emp.name}
                                        />
                                    ) : <FaUserCircle className="w-full h-full text-[#A3AED0]" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[#2B3674] truncate text-sm">{emp.name}</h4>
                                    <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-md mt-1">
                                        {emp.designation}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-5">
                                <div className="flex items-center gap-2.5 text-xs text-[#707EAE] font-semibold">
                                    <FaPhoneAlt className="text-[#A3AED0]" size={10} /> {emp.phone}
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-[#707EAE] font-semibold">
                                    <FaBuilding className="text-[#A3AED0]" size={10} /> {emp.department}
                                </div>
                            </div>

                            <div className="flex gap-2 border-t border-slate-50 pt-4">
                                <button
                                    className="flex-1 bg-[#F4F7FE] text-[#2B3674] py-2 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-1.5 group/btn"
                                    onClick={() => navigate(`/profile/${emp._id}`)}
                                >
                                    View Profile <FaChevronRight className="group-hover/btn:translate-x-0.5 transition-transform" size={8} />
                                </button>
                                <button
                                    className="px-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-transparent hover:border-red-600 shadow-sm"
                                    onClick={() => deleteEmployee(emp._id)}
                                >
                                    <FaTrash size={11} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {!loading && filteredEmployees.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-sm font-bold text-[#A3AED0]">No employees found matches your search.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeeList;