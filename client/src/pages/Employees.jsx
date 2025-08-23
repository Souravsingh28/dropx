import { useEffect, useState } from 'react';
import api from '../lib/api';
import TableWrap from '../components/TableWrap';

export default function Employees() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/employees');
    setList(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="text-lg font-semibold mb-2">Employees (linked to worker users)</div>
      {loading ? 'Loading...' : (
        <TableWrap>
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border text-left">Code</th>
                <th className="p-2 border text-left">Name</th>
                <th className="p-2 border text-left">Phone</th>
                <th className="p-2 border text-left">IFSC</th>
              </tr>
            </thead>
            <tbody>
              {list.map(e => (
                <tr key={e.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border break-words">{e.emp_code}</td>
                  <td className="p-2 border break-words">{e.name}</td>
                  <td className="p-2 border break-words">{e.phone || ''}</td>
                  <td className="p-2 border break-words">{e.ifsc || ''}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">No employees</td>
                </tr>
              )}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  );
}
