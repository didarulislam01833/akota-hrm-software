import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
    FaPlus, FaTasks, FaClock, FaCheckDouble,
    FaTrashAlt, FaChartLine, FaCommentDots
} from 'react-icons/fa';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedTo: '',
        deadline: '',
        priority: 'Medium'
    });

    // আপনার ব্যাকএন্ডের রাউট অনুযায়ী বেস ইউআরএল
    const API_BASE_URL = 'http://localhost:5000/api/tasks';
    const EMP_API_URL = 'http://localhost:5000/api/employees';

    const config = useMemo(() => {
        const token = localStorage.getItem('token');
        const cleanToken = token ? token.replace(/['"]+/g, '').trim() : '';
        return {
            headers: {
                Authorization: `Bearer ${cleanToken}`,
                'Content-Type': 'application/json'
            }
        };
    }, []);

    // ২. ডাটা ফেচিং (আপনার ব্যাকএন্ডের /all রাউট ব্যবহার করা হয়েছে)
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            try {
                // আপনার রাউট অনুযায়ী এখানে /all যোগ করা হয়েছে
                const taskRes = await axios.get(`${API_BASE_URL}/all`, config);
                setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
            } catch (taskErr) {
                console.error("Task Fetch Error:", taskErr.message);
            }

            try {
                const empRes = await axios.get(EMP_API_URL, config);
                setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
            } catch (empErr) {
                console.error("Employee Fetch Error:", empErr.message);
            }
        } catch (err) {
            console.error("🔥 Sync Error:", err.message);
        } finally {
            setLoading(false);
        }
    }, [config, API_BASE_URL, EMP_API_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ৩. নতুন টাস্ক অ্যাড করা (আপনার ব্যাকএন্ডের /create রাউট ব্যবহার করা হয়েছে)
    const handleAddTask = async (e) => {
        e.preventDefault();

        if (!newTask.assignedTo) {
            alert("Please select an agent/employee first!");
            return;
        }

        try {
            // আপনার রাউট অনুযায়ী /add এর বদলে /create করা হয়েছে
            const res = await axios.post(`${API_BASE_URL}/create`, newTask, config);
            setTasks(prev => [res.data, ...prev]);
            setShowModal(false);
            setNewTask({ title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium' });
        } catch (err) {
            console.error("Task Post Error:", err.response?.data || err.message);
            alert(`Failed: ${err.response?.data?.message || "Check server console"}`);
        }
    };

    // ৪. প্রগ্রেস আপডেট (আপনার ব্যাকএন্ডের /update/:id রাউট ব্যবহার করা হয়েছে)
    const handleUpdateProgress = async (id, currentProgress) => {
        const progressStr = prompt("Enter Progress (0-100):", currentProgress);
        if (progressStr === null) return;

        const progress = Number(progressStr);
        const status = progress === 100 ? 'Completed' : 'In Progress';

        try {
            const res = await axios.put(`${API_BASE_URL}/update/${id}`, {
                progress,
                status
            }, config);

            // আপডেট হওয়া টাস্কটি লিস্টে রিফ্লেক্ট করা
            setTasks(tasks.map(t => t._id === id ? res.data : t));
        } catch (err) {
            alert("Update failed!");
        }
    };

    // ৫. টাস্ক ডিলিট করা
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this mission?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/${id}`, config);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (err) {
            alert("Delete failed!");
        }
    };

    if (loading && tasks.length === 0) return (
        <div className="h-screen flex items-center justify-center bg-[#F8F9FD]">
            <div className="animate-pulse text-[#2B3674] font-black text-[10px] uppercase tracking-[4px]">Syncing Task Engine...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-10 text-left">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-[1000] text-[#2B3674] tracking-tighter uppercase leading-none">Mission Control</h1>
                        <p className="text-[#A3AED0] font-bold mt-2 uppercase text-[10px] tracking-[4px] italic">Mission Power Land Ltd.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#2B3674] text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
                    >
                        <FaPlus /> Create New Mission
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tasks.map((task) => (
                        <div key={task._id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 group hover:shadow-xl transition-all relative">
                            <div className="flex justify-between items-center mb-6">
                                <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {task.status}
                                </div>
                                <button onClick={() => handleDelete(task._id)} className="text-slate-200 hover:text-rose-500 transition-colors">
                                    <FaTrashAlt size={14} />
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-[#2B3674] uppercase leading-tight mb-4 group-hover:text-indigo-600 transition-colors h-14 overflow-hidden">
                                {task.title}
                            </h3>

                            <div className="mb-8 text-left">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest">Progress</span>
                                    <span className="text-[10px] font-black text-[#2B3674]">{task.progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${task.progress}%` }}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3 bg-[#F4F7FE] px-4 py-2 rounded-2xl">
                                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[9px] font-black text-indigo-600 shadow-sm uppercase">
                                        {task.assignedTo?.name?.substring(0, 2) || 'NA'}
                                    </div>
                                    <span className="text-[9px] font-black text-[#2B3674] uppercase tracking-wider">{task.assignedTo?.name || 'Unassigned'}</span>
                                </div>
                                <div className="text-[9px] font-bold text-[#A3AED0] flex items-center gap-2 uppercase tracking-widest">
                                    <FaClock className="text-indigo-400" /> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Date'}
                                </div>
                            </div>

                            <button
                                onClick={() => handleUpdateProgress(task._id, task.progress)}
                                className="w-full py-4 bg-slate-50 text-[#2B3674] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2B3674] hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <FaChartLine /> Update Progress
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#2B3674]/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-3xl font-black text-[#2B3674] uppercase mb-8 tracking-tighter">New Mission</h2>
                        <form onSubmit={handleAddTask} className="space-y-5 text-left">
                            <div>
                                <label className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Task Title</label>
                                <input
                                    required
                                    className="w-full mt-2 px-6 py-4 bg-[#F4F7FE] border-none rounded-2xl font-bold text-[#2B3674] outline-none focus:ring-2 ring-indigo-100"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Description</label>
                                <textarea
                                    className="w-full mt-2 px-6 py-4 bg-[#F4F7FE] border-none rounded-2xl font-bold text-[#2B3674] outline-none"
                                    rows="2"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Assign Agent</label>
                                <select
                                    required
                                    className="w-full mt-2 px-6 py-4 bg-[#F4F7FE] border-none rounded-2xl font-bold text-[#2B3674] outline-none"
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full mt-2 px-6 py-4 bg-[#F4F7FE] border-none rounded-2xl font-bold text-[#2B3674] outline-none"
                                        value={newTask.deadline}
                                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Priority</label>
                                    <select
                                        className="w-full mt-2 px-6 py-4 bg-[#F4F7FE] border-none rounded-2xl font-bold text-[#2B3674] outline-none"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-[#A3AED0]">Cancel</button>
                                <button type="submit" className="flex-[2] py-4 bg-[#2B3674] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Deploy Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManager;