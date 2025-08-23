import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Production() {
  const [lots, setLots] = useState([]);
  const [ops, setOps] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [lotId, setLotId] = useState('');
  const [operationId, setOperationId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [pcs, setPcs] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0,10));

  const [loadingOps, setLoadingOps] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load lots & employees when page opens
  useEffect(() => {
    (async () => {
      const [lotsRes, empRes] = await Promise.all([
        api.get('/lots'),
        api.get('/employees')
      ]);
      setLots(lotsRes.data || []);
      setEmployees(empRes.data || []);
    })();
  }, []);

  // When lot changes, load its operations
  useEffect(() => {
    if (!lotId) { setOps([]); setOperationId(''); return; }
    (async () => {
      try {
        setLoadingOps(true);
        const { data } = await api.get(`/lots/${lotId}/operations`);
        setOps(data || []);
        setOperationId(data?.[0]?.id ? String(data[0].id) : '');
      } catch (err) {
        alert(err?.response?.data?.error || 'Failed to load operations for lot');
        setOps([]);
        setOperationId('');
      } finally {
        setLoadingOps(false);
      }
    })();
  }, [lotId]);

  const saveEntry = async () => {
    const nPcs = Number(pcs);
    if (!lotId) return alert('Select a lot');
    if (!operationId) return alert('Select an operation');
    if (!employeeId) return alert('Select an employee');
    if (!Number.isFinite(nPcs) || nPcs <= 0) return alert('Enter a positive PCS');
    if (!entryDate) return alert('Select a date');

    try {
      setSaving(true);
      await api.post('/production', {
        lot_id: Number(lotId),
        operation_id: Number(operationId),
        employee_id: Number(employeeId),
        pcs: nPcs,
        entry_date: entryDate
      });
      setPcs('');
      alert('Production entry added');
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to save production entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2 min-w-0">
          <label className="block text-sm text-gray-600">Lot</label>
          <select
            className="w-full border p-2 rounded min-w-0"
            value={lotId}
            onChange={e => setLotId(e.target.value)}
          >
            <option value="">-- Select lot --</option>
            {lots.map(l => <option key={l.id} value={l.id}>{l.lot_number}</option>)}
          </select>
        </div>

        <div className="space-y-2 min-w-0">
          <label className="block text-sm text-gray-600">Operation</label>
          <select
            className="w-full border p-2 rounded min-w-0"
            value={operationId}
            onChange={e => setOperationId(e.target.value)}
            disabled={!lotId || loadingOps || ops.length === 0}
          >
            <option value="">{loadingOps ? 'Loading...' : '-- Select operation --'}</option>
            {ops.map(o => <option key={o.id} value={o.id}>{o.op_name} (₹{o.rate_per_piece})</option>)}
          </select>
          {lotId && !loadingOps && ops.length === 0 && (
            <div className="text-xs text-amber-700">
              This lot has no operations yet. Go to Lots → Edit and add operations & rates.
            </div>
          )}
        </div>

        <div className="space-y-2 min-w-0">
          <label className="block text-sm text-gray-600">Employee</label>
          <select
            className="w-full border p-2 rounded min-w-0"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
          >
            <option value="">-- Select employee --</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.emp_code} — {emp.name}</option>)}
          </select>
        </div>

        <div className="space-y-2 min-w-0">
          <label className="block text-sm text-gray-600">PCS</label>
          <input
            className="w-full border p-2 rounded min-w-0"
            placeholder="e.g. 50"
            value={pcs}
            onChange={e => setPcs(e.target.value)}
          />
        </div>

        <div className="space-y-2 min-w-0">
          <label className="block text-sm text-gray-600">Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded min-w-0"
            value={entryDate}
            onChange={e => setEntryDate(e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!lotId || !operationId || !employeeId || !pcs || saving}
        onClick={saveEntry}
      >
        {saving ? 'Saving...' : 'Add entry'}
      </button>
    </div>
  );
}
