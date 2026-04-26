import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
    FaPlus, FaClock, FaTrashAlt, FaChartLine, FaExclamationCircle
} from 'react-icons/fa';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedTo: '',
        deadline: '',
        priority: 'Medium'
    });

    // --- ধাপ ২: ডাইনামিক ইউআরএল সেটআপ ---
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const API_BASE_URL = `${BASE_URL}/api/tasks`;
    const EMP_API_URL = `${BASE_URL}/api/employees`;

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

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [taskRes, empRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/all`, config),
                axios.get(EMP_API_URL, config)
            ]);

            const taskData = taskRes.data.data || taskRes.data;
            const empData = empRes.data.data || empRes.data;

            setTasks(Array.isArray(taskData) ? taskData : []);
            setEmployees(Array.isArray(empData) ? empData : []);
        } catch (err) {
            console.error("🔥 Sync Error:", err.message);
        } finally {
            setLoading(false);
        }
    }, [config, API_BASE_URL, EMP_API_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.assignedTo) return alert("Please assign an agent!");

        try {
            const res = await axios.post(`${API_BASE_URL}/create`, newTask, config);
            const createdTask = res.data.data || res.data;
            setTasks(prev => [createdTask, ...prev]);
            setShowModal(false);
            setNewTask({ title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium' });
        } catch (err) {
            alert(err.response?.data?.message || "Deployment failed");
        }
    };

    const handleUpdateProgress = async (id, currentProgress) => {
        const progressStr = prompt("Enter Progress (0-100):", currentProgress);
        if (progressStr === null || progressStr === "") return;

        const progress = Math.min(100, Math.max(0, Number(progressStr)));
        const status = progress === 100 ? 'Completed' : 'In Progress';

        setActionLoading(id);
        try {
            const res = await axios.put(`${API_BASE_URL}/update/${id}`, { progress, status }, config);
            const updatedTask = res.data.data || res.data;
            setTasks(prev => prev.map(t => t._id === id ? updatedTask : t));
        } catch (err) {
            alert("Update failed!");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Abort this mission?")) return;
        setActionLoading(id);
        try {
            await axios.delete(`${API_BASE_URL}/${id}`, config);
            setTasks(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            alert("Delete failed!");
        } finally {
            setActionLoading(null);
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'Urgent': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Low': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading && tasks.length === 0) return (
        <div className="h-screen flex items-center justify-center bg-[#F8F9FD]">
            <div className="animate-pulse text-[#2B3674] font-black text-[10px] uppercase tracking-[4px]">Initializing Task Engine...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-10 text-left">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-[1000] text-[#2B3674] tracking-tighter uppercase leading-none">Mission Control</h1>
                        <p className="text-[#A3AED0] font-bold mt-2 uppercase text-[10px] tracking-[4px] italic">Akota Power Land Ltd.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#2B3674] text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
                    >
                        <FaPlus /> Create Mission
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tasks.map((task) => (
                        <div key={task._id} className={`bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 group hover:shadow-xl transition-all relative ${actionLoading === task._id ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex justify-between items-center mb-6">
                                <div className={`flex gap-2`}>
                                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {task.status}
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getPriorityStyle(task.priority)}`}>
                                        {task.priority}
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(task._id)} className="text-slate-200 hover:text-rose-500 transition-colors">
                                    <FaTrashAlt size={14} />
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-[#2B3674] uppercase leading-tight mb-4 group-hover:text-indigo-600 transition-colors h-14 overflow-hidden">
                                {task.title}
                            </h3>

                            <div className="mb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest">Progress</span>
                                    <span className="text-[10px] font-black text-[#2B3674]">{task.progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-700 ${task.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${task.progress}%` }}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3 bg-[#F4F7FE] px-4 py-2 rounded-2xl">
                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm uppercase">
                                        {task.assignedTo?.name?.substring(0, 2) || 'NA'}
                                    </div>
                                    <span className="text-[9px] font-black text-[#2B3674] uppercase tracking-wider">{task.assignedTo?.name || 'Unassigned'}</span>
                                </div>
                                <div className="text-[9px] font-bold text-[#A3AED0] flex items-center gap-2 uppercase tracking-widest">
                                    <FaClock className={new Date(task.deadline) < new Date() && task.status !== 'Completed' ? 'text-rose-500' : 'text-indigo-400'} />
                                    {task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'No Date'}
                                </div>
                            </div>

                            <button
                                onClick={() => handleUpdateProgress(task._id, task.progress)}
                                className="w-full py-4 bg-slate-50 text-[#2B3674] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2B3674] hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <FaChartLine /> {actionLoading === task._id ? 'Updating...' : 'Update Progress'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-[#2B3674]/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <FaExclamationCircle className="text-indigo-600 text-2xl" />
                            <h2 className="text-3xl font-black text-[#2B3674] uppercase tracking-tighter">New Mission</h2>
                        </div>
                        <form onSubmit={handleAddTask} className="space-y-5 text-left">
                            <div>
                                <label className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Title</label>
                                <input
                                    required
                                    className="w-full mt-2 px-6 py-4 bg-[#F4F7FE] border-none rounded-2xl font-bold text-[#2B3674] outline-none focus:ring-2 ring-indigo-200"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Agent Selection</label>
                                <select
                                    required
                                    className="w-full mt-2 px-6 py-4 bg-[#F4F7FE] border-none rounded-2xl font-bold text-[#2B3674] outline-none focus:ring-2 ring-indigo-200"
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                >
                                    <option value="">Select Agent</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Deadline</label>
                                    <input
                                        type="date"
                                        required
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
                                <button type="submit" className="flex-[2] py-4 bg-[#2B3674] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-colors">Deploy Now</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManager;