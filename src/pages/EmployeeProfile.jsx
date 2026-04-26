import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api'; // আমাদের কাস্টম API ইম্পোর্ট করলাম
import {
    FaUserCircle, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaBuilding,
    FaMoneyBillWave, FaArrowLeft, FaSpinner, FaDownload, FaExternalLinkAlt,
    FaExclamationTriangle, FaShieldAlt
} from 'react-icons/fa';

const EmployeeProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployeeProfile = async () => {
            try {
                setLoading(true);
                // এখন আর headers বা localhost দিতে হবে না
                const res = await API.get(`/api/employees/${id}`);
                setEmployee(res.data);
                setError(null);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError(err.response?.data?.message || "Employee Record Not Found!");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchEmployeeProfile();
    }, [id]);

    // ইমেজ পাথের জন্য ডাইনামিক ফাংশন
    const getImagePath = (path) => {
        if (!path) return null;
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FD]">
            <FaSpinner className="text-indigo-600 animate-spin mb-4" size={32} />
            <p className="text-[#A3AED0] font-black text-[10px] uppercase tracking-[4px]">Accessing Secure Database...</p>
        </div>
    );

    if (error || !employee) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FD] p-6 text-center">
            <FaExclamationTriangle className="text-rose-500 mb-4" size={50} />
            <h2 className="text-2xl font-black text-[#2B3674] uppercase tracking-tighter">Record Restricted</h2>
            <p className="text-[#A3AED0] font-bold text-sm mb-8">{error || "The profile is either missing or access is denied."}</p>
            <button onClick={() => navigate(-1)} className="bg-[#2B3674] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl">
                <FaArrowLeft /> Return to Station
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FD] pb-20 font-sans">
            <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#A3AED0] hover:text-[#2B3674] text-[10px] font-black transition-all uppercase tracking-widest"
                >
                    <FaArrowLeft /> Back to Directory
                </button>
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest border border-emerald-100">
                    <FaShieldAlt /> Verified Personnel
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4">
                <div className="relative bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-visible mb-10">
                    <div className="h-48 bg-[#2B3674] rounded-t-[3rem] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                    </div>

                    <div className="flex flex-col items-center -mt-24 pb-12 px-6">
                        <div className="relative">
                            <div className="w-44 h-44 rounded-full bg-white p-2 shadow-2xl">
                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    {employee?.profilePicPath ? (
                                        <img
                                            src={getImagePath(employee.profilePicPath)}
                                            alt={employee.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaUserCircle className="w-full h-full text-slate-200" />
                                    )}
                                </div>
                            </div>
                            <div className="absolute bottom-3 right-3 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full shadow-lg"></div>
                        </div>

                        <div className="text-center mt-6">
                            <h1 className="text-4xl font-[1000] text-[#2B3674] tracking-tighter uppercase leading-tight">
                                {employee?.name}
                            </h1>
                            <div className="flex items-center justify-center gap-4 mt-2">
                                <div className="h-[1px] w-8 bg-indigo-100"></div>
                                <p className="text-indigo-600 font-black text-xs uppercase tracking-[5px] italic">
                                    {employee?.designation}
                                </p>
                                <div className="h-[1px] w-8 bg-indigo-100"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-[#A3AED0] uppercase tracking-[3px] mb-8 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div> Core Identity
                            </h3>
                            <div className="space-y-6">
                                <ProfileDetail label="Official ID" value={employee?.employeeId ? `MPLL-${employee.employeeId}` : "MPLL-CORE-001"} />
                                <ProfileDetail label="NID Reference" value={employee?.nidNumber} />
                                <ProfileDetail label="Enrollment Date" value={employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-[#A3AED0] uppercase tracking-[3px] mb-6">Credential Vault</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <DocButton icon={<FaDownload />} label="View Dossier (CV)" link={getImagePath(employee?.cvPath)} color="indigo" />
                                <DocButton icon={<FaExternalLinkAlt />} label="NID Record" link={getImagePath(employee?.nidPhotoPath)} color="slate" />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <FaPhoneAlt size={80} />
                            </div>
                            <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[4px] mb-8">Registry Contacts</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoBlock icon={<FaPhoneAlt />} label="Corporate Mobile" value={employee?.phone} />
                                <InfoBlock icon={<FaEnvelope />} label="Secure Email" value={employee?.email} />
                                <InfoBlock icon={<FaMapMarkerAlt />} label="Permanent Residence" value={employee?.presentAddress} isFull />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                            <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[4px] mb-8">Departmental Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoBlock icon={<FaBuilding />} label="Business Department" value={employee?.department} />
                                <InfoBlock icon={<FaMoneyBillWave />} label="Monthly Remuneration" value={employee?.salary ? `${employee.salary} BDT` : "Negotiable"} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- হেল্পার কম্পোনেন্ট ---

const ProfileDetail = ({ label, value }) => (
    <div className="border-l-2 border-slate-50 pl-4">
        <p className="text-[9px] font-bold text-[#A3AED0] uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-[#2B3674]">{value || 'NOT FILED'}</p>
    </div>
);

const InfoBlock = ({ icon, label, value, isFull }) => (
    <div className={`flex items-start gap-4 ${isFull ? 'md:col-span-2' : ''}`}>
        <div className="w-10 h-10 rounded-2xl bg-[#F4F7FE] flex items-center justify-center text-indigo-600 shrink-0 border border-white shadow-sm">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest mb-1">{label}</p>
            <p className="text-[15px] font-bold text-[#2B3674] leading-tight">{value || '---'}</p>
        </div>
    </div>
);

const DocButton = ({ icon, label, link, color }) => {
    if (!link || link.endsWith('null') || link.endsWith('undefined')) return null;
    return (
        <a
            href={link} target="_blank" rel="noreferrer"
            className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
            ${color === 'indigo' ? 'bg-[#2B3674] text-white border-[#2B3674] hover:bg-indigo-600 shadow-lg' : 'bg-white text-[#2B3674] border-slate-100 hover:bg-slate-50'}`}
        >
            {label} {icon}
        </a>
    );
};

export default EmployeeProfile;