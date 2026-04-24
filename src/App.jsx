import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Pages Import (আপনার আগের ইম্পোর্টগুলো ঠিক আছে)
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import EmployeeProfile from './pages/EmployeeProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import PayrollReports from './pages/PayrollReports';
import SalarySlip from './pages/SalarySlip';
import Settings from './pages/Settings';
import LeaveApply from './pages/LeaveApply';
import LeaveManagement from './pages/LeaveManagement';
import NoticeBoard from './pages/NoticeBoard';
import TaskManager from './pages/TaskManager';

function App() {
  const location = useLocation();
  const auth = useContext(AuthContext);

  const user = auth?.user || null;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '📊', roles: ['admin', 'employee'] },
    { name: 'Notice Board', path: '/notices', icon: '📢', roles: ['admin', 'employee'] },
    { name: 'Tasks', path: '/tasks', icon: '✅', roles: ['admin', 'employee'] },
    { name: 'Employees', path: '/employees', icon: '👥', roles: ['admin'] },
    { name: 'Add Employee', path: '/add', icon: '➕', roles: ['admin'] },
    { name: 'Attendance', path: '/attendance', icon: '🕒', roles: ['admin', 'employee'] },
    { name: 'Apply Leave', path: '/apply-leave', icon: '📝', roles: ['employee', 'admin'] },
    { name: 'Leave Requests', path: '/leave-management', icon: '📂', roles: ['admin'] },
    { name: 'Payroll', path: '/payroll', icon: '💰', roles: ['admin'] },
    { name: 'Payroll Reports', path: '/payroll-reports', icon: '📜', roles: ['admin'] },
    { name: 'My Profile', path: user ? `/profile/${user?._id || user?.id}` : '#', icon: '👤', roles: ['employee', 'admin'] },
    { name: 'Settings', path: '/settings', icon: '⚙️', roles: ['admin', 'employee'] },
  ];

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-[#F4F7FE] transition-all font-sans overflow-hidden">

      {/* Sidebar Section */}
      {!isAuthPage && user && (
        <aside className="w-64 bg-white flex flex-col z-20 shrink-0 border-r border-slate-200">
          <div className="p-6 mb-4">
            <h1 className="text-xl font-bold text-[#2B3674] tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">AP</div>
              AKOTA POWER
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar text-left">
            {filteredMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 transition-all duration-200 rounded-md ${isActive
                    ? 'text-indigo-600 font-bold bg-indigo-50/50 border-r-4 border-indigo-600'
                    : 'text-slate-500 hover:text-indigo-500 font-medium'
                    }`}
                >
                  <span className={`text-lg ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span className="text-[14px]">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header Section */}
        {!isAuthPage && user && (
          <header className="h-20 flex items-center justify-between px-10 shrink-0 z-10">
            <div className="text-left">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-tight">Pages / {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}</p>
              <h2 className="text-2xl font-bold text-[#2B3674] capitalize mt-0.5">
                {location.pathname === '/' ? 'Main Dashboard' : location.pathname.split('/')[1]?.replace(/-/g, ' ')}
              </h2>
            </div>

            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="text-right border-r border-slate-100 pr-4">
                <p className="text-xs font-bold text-[#2B3674]">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{user?.role}</p>
              </div>
              <button onClick={auth.logout} className="text-slate-400 hover:text-red-500 transition-colors text-sm font-bold">Logout</button>
            </div>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto ${isAuthPage ? 'p-0' : 'p-6 md:p-10'}`}>
          <div className={!isAuthPage ? "max-w-[1600px] mx-auto" : ""}>
            <Routes>
              {/* ১. পাবলিক রাউট */}
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

              {/* ২. প্রোটেক্টেড রাউট (সবার জন্য) */}
              <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
              <Route path="/notices" element={user ? <NoticeBoard /> : <Navigate to="/login" replace />} />
              <Route path="/tasks" element={user ? <TaskManager /> : <Navigate to="/login" replace />} />
              <Route path="/attendance" element={user ? <Attendance /> : <Navigate to="/login" replace />} />
              <Route path="/apply-leave" element={user ? <LeaveApply /> : <Navigate to="/login" replace />} />
              <Route path="/profile/:id" element={user ? <EmployeeProfile /> : <Navigate to="/login" replace />} />

              {/* ৩. এডমিন রাউট (নিশ্চিত করা হয়েছে যেন সঠিক ইউজার এক্সেস পায়) */}
              <Route path="/employees" element={user?.role === 'admin' ? <EmployeeList /> : <Navigate to="/" replace />} />
              <Route path="/add" element={user?.role === 'admin' ? <AddEmployee /> : <Navigate to="/" replace />} />
              <Route path="/edit/:id" element={user?.role === 'admin' ? <AddEmployee isEdit={true} /> : <Navigate to="/" replace />} />
              <Route path="/leave-management" element={user?.role === 'admin' ? <LeaveManagement /> : <Navigate to="/" replace />} />
              <Route path="/payroll" element={user?.role === 'admin' ? <Payroll /> : <Navigate to="/" replace />} />
              <Route path="/payroll-reports" element={user?.role === 'admin' ? <PayrollReports /> : <Navigate to="/" replace />} />
              <Route path="/salary-slip/:id" element={user?.role === 'admin' ? <SalarySlip /> : <Navigate to="/" replace />} />
              <Route path="/settings" element={user?.role === 'admin' ? <Settings /> : <Navigate to="/" replace />} />

              {/* ৪. ক্যাচ-অল (সবার নিচে থাকবে) */}
              <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;