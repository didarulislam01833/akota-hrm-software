import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaClock, FaSync, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // ডিফল্টভাবে আজকের তারিখ সেট করা (YYYY-MM-DD)
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const API_URL = 'http://localhost:5000';

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token')?.replace(/"/g, '');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [empRes, attRes] = await Promise.all([
                axios.get(`${API_URL}/api/employees`, config),
                axios.get(`${API_URL}/api/attendance/all`, config)
            ]);

            setEmployees(empRes.data || []);
            setAttendanceRecords(attRes.data || []);
            console.log("Employees Loaded:", empRes.data.length);
            console.log("Records Loaded:", attRes.data.length);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    // আইডি ম্যাচিং লজিক যা সব ধরণের ফরমেট সাপোর্ট করবে
    const getStatus = (empId) => {
        if (!empId) return null;
        return attendanceRecords.find(r => {
            const recordEmpId = r.employee?._id || r.employee;
            return recordEmpId?.toString().trim() === empId.toString().trim();
        });
    };

    // এক্সেল এক্সপোর্ট ফাংশন
    const exportToExcel = () => {
        const reportData = [];

        employees.forEach(emp => {
            const record = getStatus(emp._id);
            if (record && record.date) {
                const cleanRecordDate = record.date.substring(0, 10);
                if (cleanRecordDate >= startDate && cleanRecordDate <= endDate) {
                    reportData.push({
                        "Employee Name": emp.name,
                        "Designation": emp.designation,
                        "Date": cleanRecordDate,
                        "In Time": record.checkIn?.time || '--:--',
                        "Status": record.status || 'Present',
                        "Location": record.checkIn?.locationName || 'Office'
                    });
                }
            }
        });

        if (reportData.length === 0) {
            alert(`No data found between ${startDate} and ${endDate}`);
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
    };

    // পিডিএফ এক্সপোর্ট ফাংশন
    const exportToPDF = () => {
        const rows = [];
        employees.forEach(emp => {
            const record = getStatus(emp._id);
            if (record && record.date) {
                const cleanRecordDate = record.date.substring(0, 10);
                if (cleanRecordDate >= startDate && cleanRecordDate <= endDate) {
                    rows.push([
                        emp.name,
                        emp.designation,
                        cleanRecordDate,
                        record.checkIn?.time || '--:--',
                        record.status || 'Present',
                        record.checkIn?.locationName || 'Office'
                    ]);
                }
            }
        });

        if (rows.length === 0) {
            alert("No data found for the selected range!");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("AKOTA POWER - ATTENDANCE REPORT", 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Report Period: ${startDate} to ${endDate}`, 14, 22);

        autoTable(doc, {
            head: [["Name", "Designation", "Date", "In Time", "Status", "Location"]],
            body: rows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], halign: 'center' },
            styles: { fontSize: 9 },
        });

        doc.save(`Attendance_${startDate}.pdf`);
    };

    return (
        <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Attendance Analytics</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        System Ready: {attendanceRecords.length} Total Logs
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Picker Group */}
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-600 outline-none"
                        />
                        <span className="text-slate-300 font-bold text-xs px-1">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-600 outline-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <FaFileExcel /> Excel
                    </button>

                    <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                        <FaFilePdf /> PDF
                    </button>

                    <button onClick={fetchAttendanceData} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                        <FaSync className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">
                            <th className="px-6 py-2">Employee Detail</th>
                            <th className="px-6 py-2">Clock In</th>
                            <th className="px-6 py-2 text-center">Status</th>
                            <th className="px-6 py-2 text-right">Activity Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => {
                            const record = getStatus(emp._id);
                            return (
                                <tr key={emp._id} className="bg-white border border-slate-50 shadow-sm rounded-2xl hover:bg-slate-50 transition-all">
                                    <td className="px-6 py-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                                            {emp.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-sm leading-none mb-1">{emp.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{emp.designation}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-xs font-black text-slate-600">
                                        {record?.checkIn?.time || '--:--'}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${record?.status === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {record?.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-xs font-bold text-slate-400 text-right">
                                        {record?.date?.substring(0, 10) || 'No Entry'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;