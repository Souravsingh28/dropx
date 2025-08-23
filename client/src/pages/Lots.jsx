import { useEffect, useState } from 'react';
import api from '../lib/api';
import TableWrap from '../components/TableWrap';

function emptyOp() {
  return { op_name: '', rate_per_piece: '' };
}

export default function Lots() {
  const [lots, setLots] = useState([]);
  const [createLot, setCreateLot] = useState({
    lot_number: '',
    target_qty: '',
    operations: [emptyOp()],
  });
  const [savingCreate, setSavingCreate] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    const { data } = await api.get('/lots?with_ops=1');
    setLots(data);
  };
  useEffect(() => { load(); }, []);

  // ---------- Create Lot ----------
  const addCreateOpRow = () => {
    setCreateLot((s) => ({ ...s, operations: [...s.operations, emptyOp()] }));
  };
  const removeCreateOpRow = (idx) => {
    setCreateLot((s) => {
      const ops = s.operations.slice();
      ops.splice(idx, 1);
      return { ...s, operations: ops.length ? ops : [emptyOp()] };
    });
  };
  const setCreateOpField = (idx, key, val) => {
    setCreateLot((s) => {
      const ops = s.operations.slice();
      ops[idx] = { ...ops[idx], [key]: val };
      return { ...s, operations: ops };
    });
  };

  const submitCreateLot = async () => {
    const lot_number = (createLot.lot_number || '').trim();
    const target_qty = createLot.target_qty ? Number(createLot.target_qty) : null;
    if (!lot_number) return alert('lot_number is required');
    if (target_qty !== null && (!Number.isFinite(target_qty) || target_qty < 0))
      return alert('target_qty must be a positive number or empty');

    const operations = createLot.operations
      .map((op) => ({
        op_name: (op.op_name || '').trim(),
        rate_per_piece: Number(op.rate_per_piece),
      }))
      .filter((op) => op.op_name);

    if (operations.length === 0) return alert('Add at least one operation');
    if (operations.some((op) => !Number.isFinite(op.rate_per_piece) || op.rate_per_piece <= 0))
      return alert('Each operation needs a positive rate');

    try {
      setSavingCreate(true);
      await api.post('/lots', { lot_number, target_qty, operations });
      setCreateLot({ lot_number: '', target_qty: '', operations: [emptyOp()] });
      await load();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to create lot');
    } finally {
      setSavingCreate(false);
    }
  };

  // ---------- Edit Lot ----------
  const startEdit = (lot) => {
    setEditingId(lot.id);
    setEditForm({
      lot_number: lot.lot_number || '',
      target_qty: lot.target_qty ?? '',
      operations: (lot.operations || []).map((o) => ({
        op_name: o.op_name,
        rate_per_piece: String(o.rate_per_piece),
      })),
    });
    if (!lot.operations || lot.operations.length === 0) {
      setEditForm((s) => ({ ...s, operations: [emptyOp()] }));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const addEditOpRow = () => {
    setEditForm((s) => ({ ...s, operations: [...s.operations, emptyOp()] }));
  };
  const removeEditOpRow = (idx) => {
    setEditForm((s) => {
      const ops = s.operations.slice();
      ops.splice(idx, 1);
      return { ...s, operations: ops.length ? ops : [emptyOp()] };
    });
  };
  const setEditOpField = (idx, key, val) => {
    setEditForm((s) => {
      const ops = s.operations.slice();
      ops[idx] = { ...ops[idx], [key]: val };
      return { ...s, operations: ops };
    });
  };

  const submitEdit = async (lotId) => {
    const lot_number = (editForm.lot_number || '').trim();
    const target_qty = editForm.target_qty === '' ? null : Number(editForm.target_qty);
    if (!lot_number) return alert('lot_number is required');
    if (target_qty !== null && (!Number.isFinite(target_qty) || target_qty < 0))
      return alert('target_qty must be a positive number or empty');

    const operations = editForm.operations
      .map((op) => ({
        op_name: (op.op_name || '').trim(),
        rate_per_piece: Number(op.rate_per_piece),
      }))
      .filter((op) => op.op_name);

    if (operations.length === 0) return alert('Add at least one operation');
    if (operations.some((op) => !Number.isFinite(op.rate_per_piece) || op.rate_per_piece <= 0))
      return alert('Each operation needs a positive rate');

    try {
      setSavingEdit(true);
      await api.put(`/lots/${lotId}`, { lot_number, target_qty, operations });
      await load();
      cancelEdit();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update lot');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Create Lot */}
      <div>
        <div className="text-lg font-semibold mb-2">Create lot</div>
        <div className="space-y-2">
          <input
            className="w-full border p-2 rounded min-w-0"
            placeholder="LOT NUMBER"
            value={createLot.lot_number}
            onChange={(e) => setCreateLot({ ...createLot, lot_number: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded min-w-0"
            placeholder="TARGET QTY (optional)"
            value={createLot.target_qty}
            onChange={(e) => setCreateLot({ ...createLot, target_qty: e.target.value })}
          />

          <div className="mt-2">
            <div className="font-medium mb-1">Operations</div>
            {createLot.operations.map((op, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 mb-2">
                <input
                  className="border p-2 rounded min-w-0"
                  placeholder="Operation name"
                  value={op.op_name}
                  onChange={(e) => setCreateOpField(idx, 'op_name', e.target.value)}
                />
                <input
                  className="border p-2 rounded w-28 min-w-0"
                  placeholder="Rate"
                  value={op.rate_per_piece}
                  onChange={(e) => setCreateOpField(idx, 'rate_per_piece', e.target.value)}
                />
                <button
                  type="button"
                  className="border px-3 rounded"
                  onClick={() => removeCreateOpRow(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="border px-3 rounded" onClick={addCreateOpRow}>
              + Add operation
            </button>
          </div>

          <button
            type="button"
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!createLot.lot_number.trim() || savingCreate}
            onClick={submitCreateLot}
          >
            {savingCreate ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Lots list with Edit */}
      <div>
        <div className="text-lg font-semibold mb-2">Lots</div>
        <div className="space-y-4">
          {lots.map((l) => (
            <div key={l.id} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium break-words">
                  {l.lot_number}{' '}
                  <span className="text-sm text-gray-500">Target: {l.target_qty ?? '—'}</span>
                </div>
                <button
                  type="button"
                  className="border px-3 rounded"
                  onClick={() => startEdit(l)}
                >
                  Edit
                </button>
              </div>

              <div className="mt-2">
                <TableWrap>
                  <table className="w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-1 border text-left">Op</th>
                        <th className="p-1 border text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(l.operations || []).map((o) => (
                        <tr key={o.id}>
                          <td className="p-1 border break-words">{o.op_name}</td>
                          <td className="p-1 border text-right">{o.rate_per_piece}</td>
                        </tr>
                      ))}
                      {(l.operations || []).length === 0 && (
                        <tr>
                          <td className="p-2 border text-gray-500" colSpan={2}>
                            No operations
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </TableWrap>
              </div>

              {/* Inline editor */}
              {editingId === l.id && editForm && (
                <div className="mt-4 border-t pt-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      className="border p-2 rounded min-w-0"
                      placeholder="LOT NUMBER"
                      value={editForm.lot_number}
                      onChange={(e) => setEditForm({ ...editForm, lot_number: e.target.value })}
                    />
                    <input
                      className="border p-2 rounded min-w-0"
                      placeholder="TARGET QTY (optional)"
                      value={editForm.target_qty ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, target_qty: e.target.value })}
                    />
                  </div>

                  <div className="font-medium mb-1">Operations</div>
                  {editForm.operations.map((op, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2 mb-2">
                      <input
                        className="border p-2 rounded min-w-0"
                        placeholder="Operation name"
                        value={op.op_name}
                        onChange={(e) => setEditOpField(idx, 'op_name', e.target.value)}
                      />
                      <input
                        className="border p-2 rounded w-28 min-w-0"
                        placeholder="Rate"
                        value={op.rate_per_piece}
                        onChange={(e) => setEditOpField(idx, 'rate_per_piece', e.target.value)}
                      />
                      <button
                        type="button"
                        className="border px-3 rounded"
                        onClick={() => removeEditOpRow(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="border px-3 rounded mr-2"
                    onClick={addEditOpRow}
                  >
                    + Add operation
                  </button>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={savingEdit}
                      onClick={() => submitEdit(l.id)}
                    >
                      {savingEdit ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      className="border px-4 py-2 rounded"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {lots.length === 0 && (
            <div className="text-sm text-gray-500">No lots yet — create one on the left.</div>
          )}
        </div>
      </div>
    </div>
  );
}
