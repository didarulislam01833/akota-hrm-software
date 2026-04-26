import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUserCircle, FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // প্রোডাকশন বা লোকালহস্ট URL কনফিগারেশন
            const res = await axios.post('https://akota-hrm-server.onrender.com/api/auth/register', formData);
            if (res.data) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Server connection failed. Please try again later.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] px-4 font-sans">
            <div className="max-w-[500px] w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(43,54,116,0.08)] overflow-hidden border border-slate-50">

                {/* Brand Header */}
                <div className="p-10 bg-[#2B3674] text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
                            Create <span className="text-indigo-400">Account</span>
                        </h1>
                        <p className="text-indigo-200 text-[9px] uppercase tracking-[4px] mt-2 font-bold opacity-80">
                            Personnel Enrollment System
                        </p>
                    </div>
                    {/* Decorative Element */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                </div>

                <div className="p-10 pt-8">
                    {/* Status Alerts */}
                    {error && (
                        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[11px] mb-6 border border-rose-100 font-black flex items-center gap-2 animate-in slide-in-from-top-2">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-[11px] mb-6 border border-emerald-100 font-black flex items-center gap-2 animate-in zoom-in-95">
                            <span className="text-lg">✅</span> ENROLLMENT SUCCESSFUL! ACCESS GRANTED.
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-1 flex items-center gap-2">
                                <FaUserCircle /> Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Didarul Islam"
                                className="w-full h-12 px-5 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-[#2B3674] placeholder:text-slate-300 outline-none"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-1 flex items-center gap-2">
                                <FaEnvelope /> Professional Email
                            </label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                className="w-full h-12 px-5 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-[#2B3674] placeholder:text-slate-300 outline-none"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FaLock /> Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full h-12 px-5 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-[#2B3674] outline-none"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FaShieldAlt /> Access Level
                                </label>
                                <select
                                    className="w-full h-12 px-4 bg-[#F4F7FE] border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-black text-[11px] uppercase tracking-wider cursor-pointer text-[#2B3674] outline-none appearance-none"
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="employee">Staff (Employee)</option>
                                    <option value="admin">Admin (Executive)</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`w-full h-14 bg-[#2B3674] hover:bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.97] flex items-center justify-center uppercase tracking-[2px] text-[10px] mt-4 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </div>
                            ) : success ? 'Redirecting to Login...' : 'Confirm Registration'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[11px] text-[#A3AED0] font-bold uppercase tracking-wide">
                            Established Identity?
                            <Link to="/login" className="ml-2 text-indigo-600 font-black hover:text-[#2B3674] transition-colors underline decoration-2 underline-offset-4">
                                Authentication Portal
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;