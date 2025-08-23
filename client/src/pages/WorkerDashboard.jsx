import { useEffect, useState } from 'react';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WorkerDashboard() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [monthly, setMonthly] = useState([]);
  const [range, setRange] = useState({ from: '', to: '' });

  const loadSummary = async () => {
    const { data } = await api.get('/worker/summary', { params: range });
    setEntries(data.entries);
    setTotal(data.total_income);
  };

  const loadMonthly = async () => {
    const { data } = await api.get('/worker/monthly');
    setMonthly(data);
  };

  useEffect(() => {
    loadSummary();
    loadMonthly();
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">My Income</h2>
        <div className="text-2xl font-bold">₹{total.toFixed(2)}</div>

        {/* Date filter */}
        <div className="mt-3 flex gap-2 flex-wrap">
          <input type="date" value={range.from} onChange={e=>setRange({...range, from:e.target.value})}
            className="border rounded p-2" />
          <input type="date" value={range.to} onChange={e=>setRange({...range, to:e.target.value})}
            className="border rounded p-2" />
          <button className="bg-black text-white px-3 py-2 rounded" onClick={loadSummary}>
            Filter
          </button>
        </div>
      </div>

      {/* Work entries table */}
      <div className="rounded-xl border bg-white p-4 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Work Details</h2>
        <table className="min-w-[600px] w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Lot</th>
              <th className="p-2 border">Operation</th>
              <th className="p-2 border">Rate</th>
              <th className="p-2 border">PCS</th>
              <th className="p-2 border">Income</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td className="p-2 border">{e.entry_date}</td>
                <td className="p-2 border">{e.lot_number}</td>
                <td className="p-2 border">{e.op_name}</td>
                <td className="p-2 border">₹{e.rate_per_piece}</td>
                <td className="p-2 border">{e.pcs}</td>
                <td className="p-2 border">₹{e.income}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-center text-gray-500">No records</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Monthly chart */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Monthly Income</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthly}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_income" fill="#0f172a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
