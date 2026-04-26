import { useState, useContext } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await API.post('/api/auth/login', formData);
            if (res.data.token) {
                // --- গুরুত্বপূর্ণ পরিবর্তন এখানে ---
                // ডাটাবেস থেকে আসা ইউজার অবজেক্ট এবং টোকেন লোকাল স্টোরেজে সেভ করছি
                // যেন LeaveApply বা Profile পেজে আইডি খুঁজে পাওয়া যায়
                localStorage.setItem('user', JSON.stringify(res.data.user));
                localStorage.setItem('token', res.data.token);

                // কনটেক্সট আপডেট করা
                login(res.data.user, res.data.token);

                navigate('/');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "সার্ভারের সাথে কানেকশন দেওয়া যাচ্ছে না!";
            setError(errorMessage);
            console.error("Frontend Login Error:", err.response);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans text-left">
            <div className="max-w-[450px] w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100">

                {/* Header Section */}
                <div className="p-10 bg-slate-900 text-center relative overflow-hidden">
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase relative z-10">
                        Akota Power <span className="text-blue-500">HRM</span>
                    </h1>
                    <p className="text-slate-400 text-[9px] uppercase tracking-[4px] mt-2 font-bold relative z-10">Authorized Access Only</p>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
                </div>

                <div className="p-10">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[12px] mb-8 border border-red-100 font-black flex items-center gap-3 animate-bounce">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                <button type="button" className="text-[10px] font-black text-blue-600 uppercase tracking-tight hover:underline">Forgot?</button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold tracking-widest"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`w-full h-14 bg-blue-600 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center uppercase tracking-[2px] text-xs ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </div>
                            ) : 'Sign In Now'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                            Don't have an account?
                            <Link to="/register" className="ml-2 text-blue-600 hover:text-slate-900 transition-colors border-b-2 border-blue-600/20 pb-0.5">
                                Register Your Business
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 grayscale opacity-40 hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[2px]">Powered By</span>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic">Eye Catcher Co.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;