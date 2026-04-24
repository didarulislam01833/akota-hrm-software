import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    FaUser, FaPhone, FaIdCard, FaCamera, FaArrowLeft,
    FaCloudUploadAlt, FaFilePdf, FaBuilding, FaEnvelope, FaMoneyBillWave
} from 'react-icons/fa';

const AddEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profileImage, setProfileImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [nidFile, setNidFile] = useState(null);
    const [cvFile, setCvFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', designation: '',
        department: '', nidNumber: '', presentAddress: '', salary: 0
    });

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        if (id) {
            const fetchEmployee = async () => {
                try {
                    const token = getToken();
                    const res = await axios.get(`http://localhost:5000/api/employees/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFormData(res.data);
                } catch (err) {
                    console.error("Fetch Error:", err);
                }
            };
            fetchEmployee();
        }
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = getToken();
        if (!token) { navigate('/login'); return; }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imageFile) data.append('profileImage', imageFile);
        if (nidFile) data.append('nidFile', nidFile);
        if (cvFile) data.append('cvFile', cvFile);

        try {
            const url = id ? `http://localhost:5000/api/employees/update/${id}` : 'http://localhost:5000/api/employees/add';
            await axios({
                method: id ? 'put' : 'post',
                url, data,
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });
            alert("Success!");
            navigate('/employees');
        } catch (err) {
            alert(err.response?.data?.message || "Error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-6 px-4 animate-in fade-in duration-500">
            {/* Header - More Compact */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#2B3674]">
                        {id ? "Update Profile" : "Add New Employee"}
                    </h2>
                    <p className="text-xs text-[#A3AED0] font-medium">Fill in the details below</p>
                </div>
                <button
                    onClick={() => navigate('/employees')}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#A3AED0] hover:text-indigo-600 transition-colors"
                >
                    <FaArrowLeft /> Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Profile Image - Smaller size */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-[#F4F7FE] border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                            {profileImage ? (
                                <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <FaUser className="text-3xl text-[#A3AED0]" />
                            )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white">
                            <FaCamera size={12} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                {/* Form Card - Reduced Padding */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Compact Input Style */}
                        {[
                            { label: "Full Name", icon: FaUser, key: "name", type: "text", placeholder: "Didarul Islam" },
                            { label: "Email Address", icon: FaEnvelope, key: "email", type: "email", placeholder: "didar@example.com" },
                            { label: "Phone Number", icon: FaPhone, key: "phone", type: "tel", placeholder: "017xxxxxxxx" },
                            { label: "NID Number", icon: FaIdCard, key: "nidNumber", type: "text", placeholder: "19xxxxxxxx" },
                            { label: "Basic Salary", icon: FaMoneyBillWave, key: "salary", type: "number", placeholder: "Salary in BDT" }
                        ].map((input) => (
                            <div key={input.key} className="space-y-1.5">
                                <label className="text-[11px] font-bold text-[#2B3674] ml-1 uppercase tracking-tight">{input.label}</label>
                                <div className="relative group">
                                    <input
                                        type={input.type}
                                        value={formData[input.key]}
                                        onChange={(e) => setFormData({ ...formData, [input.key]: e.target.value })}
                                        className="w-full h-10 pl-10 pr-4 bg-[#F4F7FE] rounded-xl border-none focus:ring-1 focus:ring-indigo-400 text-sm font-medium text-[#2B3674] outline-none transition-all"
                                        placeholder={input.placeholder}
                                        required
                                    />
                                    <input.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3AED0] text-xs" />
                                </div>
                            </div>
                        ))}

                        {/* Department Dropdown */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#2B3674] ml-1 uppercase tracking-tight">Department</label>
                            <div className="relative">
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full h-10 pl-10 pr-4 bg-[#F4F7FE] rounded-xl border-none focus:ring-1 focus:ring-indigo-400 text-sm font-medium text-[#2B3674] appearance-none outline-none cursor-pointer"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Production">Production</option>
                                    <option value="Sales">Sales & Marketing</option>
                                    <option value="HR">Human Resource</option>
                                </select>
                                <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3AED0] text-xs" />
                            </div>
                        </div>

                        {/* Designation */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#2B3674] ml-1 uppercase tracking-tight">Designation</label>
                            <input
                                type="text"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                className="w-full h-10 px-4 bg-[#F4F7FE] rounded-xl border-none focus:ring-1 focus:ring-indigo-400 text-sm font-medium text-[#2B3674] outline-none"
                                placeholder="Software Engineer"
                                required
                            />
                        </div>

                        {/* Address - Full Width */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[11px] font-bold text-[#2B3674] ml-1 uppercase tracking-tight">Present Address</label>
                            <input
                                type="text"
                                value={formData.presentAddress}
                                onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                                className="w-full h-10 px-4 bg-[#F4F7FE] rounded-xl border-none focus:ring-1 focus:ring-indigo-400 text-sm font-medium text-[#2B3674] outline-none"
                                placeholder="Gazipur, Dhaka"
                                required
                            />
                        </div>
                    </div>

                    {/* File Uploads - Grid layout simplified */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50">
                        <label className="cursor-pointer group">
                            <div className="p-3 border border-dashed border-indigo-100 rounded-xl bg-[#F8FAFF] hover:border-indigo-400 transition-all text-center">
                                <FaCloudUploadAlt className="text-indigo-500 mx-auto mb-1 text-base" />
                                <span className="text-[10px] font-bold text-[#707EAE] uppercase block">NID Copy</span>
                                <input type="file" className="hidden" onChange={(e) => setNidFile(e.target.files[0])} required={!id} />
                                {nidFile && <p className="text-[9px] text-emerald-500 truncate mt-1">{nidFile.name}</p>}
                            </div>
                        </label>

                        <label className="cursor-pointer group">
                            <div className="p-3 border border-dashed border-red-50 rounded-xl bg-[#FFF8F8] hover:border-red-300 transition-all text-center">
                                <FaFilePdf className="text-red-400 mx-auto mb-1 text-base" />
                                <span className="text-[10px] font-bold text-[#707EAE] uppercase block">Resume (PDF)</span>
                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => setCvFile(e.target.files[0])} required={!id} />
                                {cvFile && <p className="text-[9px] text-emerald-500 truncate mt-1">{cvFile.name}</p>}
                            </div>
                        </label>
                    </div>
                </div>

                {/* Submit Button - More balanced */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#2B3674] text-white rounded-xl font-bold text-sm tracking-wider shadow-md hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? "Processing..." : (id ? "Save Updates" : "Add Employee")}
                </button>
            </form>
        </div>
    );
};

export default AddEmployee;