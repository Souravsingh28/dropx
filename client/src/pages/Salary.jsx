import { useEffect, useState } from 'react';
import api from '../lib/api';
import TableWrap from '../components/TableWrap';

function yyyymm(d) { return d.toISOString().slice(0,7); }

export default function Salary() {
  const [month, setMonth] = useState(yyyymm(new Date()));
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await api.get('/payroll', { params: { month } });
    setRows(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-lg font-semibold">Payroll</div>
        <input
          type="month"
          className="border p-2 rounded"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
        <button onClick={load} className="border px-3 py-2 rounded">Load</button>
      </div>

      <TableWrap>
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border text-left">Code</th>
              <th className="p-2 border text-left">Name</th>
              <th className="p-2 border text-right">Earnings</th>
              <th className="p-2 border text-right">Incentives</th>
              <th className="p-2 border text-right">Deductions</th>
              <th className="p-2 border text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.employee_id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border break-words">{r.emp_code}</td>
                <td className="p-2 border break-words">{r.name}</td>
                <td className="p-2 border text-right">₹{Number(r.earnings).toFixed(2)}</td>
                <td className="p-2 border text-right">₹{Number(r.incentives).toFixed(2)}</td>
                <td className="p-2 border text-right">₹{Number(r.deductions).toFixed(2)}</td>
                <td className="p-2 border text-right font-semibold">₹{Number(r.net_salary).toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No data for this month</td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}
