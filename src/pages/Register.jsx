import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // আইকন ইমপোর্ট করা হয়েছে

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee' // ডিফল্ট রোল
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // পাসওয়ার্ড দেখানোর স্টেট

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // আপনার লোকালহোস্টের সঠিক পোর্ট (5000) নিশ্চিত করুন
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            if (res.data) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000); // ২ সেকেন্ড পর লগইন পেজে নিয়ে যাবে
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Unable to connect to the server. Please check if the backend is running.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
            <div className="max-w-[500px] w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="p-10 bg-slate-900 text-center relative overflow-hidden">
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase relative z-10">
                        Create <span className="text-blue-500">Account</span>
                    </h1>
                    <p className="text-slate-400 text-[9px] uppercase tracking-[4px] mt-2 font-bold relative z-10">Join Akota Power HRM</p>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
                </div>

                <div className="p-10">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[12px] mb-6 border border-red-100 font-black animate-shake">
                            ⚠️ {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-[12px] mb-6 border border-emerald-100 font-black flex items-center gap-2">
                            ✅ Registration Successful! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="grid grid-cols-1 gap-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Didarul Islam"
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Level</label>
                                <select
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-black text-[11px] uppercase tracking-wider cursor-pointer"
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`w-full h-14 bg-blue-600 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center uppercase tracking-[2px] text-xs mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </div>
                            ) : 'Confirm Registration'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                            Already have an account?
                            <Link to="/login" className="ml-2 text-blue-600 font-black hover:text-slate-900 transition-colors">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;