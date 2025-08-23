import { useEffect, useState } from 'react'
import api from '../lib/api'
export default function Dashboard(){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { const { data } = await api.get('/dashboard/summary'); setData(data); setLoading(false) })() }, [])
  if (loading) return <div>Loading...</div>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded p-4"><div className="text-sm text-gray-500">Employees</div><div className="text-2xl font-bold">{data.totals.employees}</div></div>
        <div className="border rounded p-4"><div className="text-sm text-gray-500">Lots</div><div className="text-2xl font-bold">{data.lotsCount.lots}</div></div>
      </div>
      <div>
        <div className="text-lg font-semibold mb-2">Recent Production</div>
        <div className="overflow-auto">
          <table className="min-w-full border">
            <thead><tr className="bg-gray-50"><th className="p-2 border">Date</th><th className="p-2 border">Employee</th><th className="p-2 border">Lot</th><th className="p-2 border">Operation</th><th className="p-2 border">PCS</th></tr></thead>
            <tbody>{data.recent.map(r => (<tr key={r.id}><td className="p-2 border">{r.entry_date}</td><td className="p-2 border">{r.name}</td><td className="p-2 border">{r.lot_number}</td><td className="p-2 border">{r.op_name}</td><td className="p-2 border text-right">{r.pcs}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
      <div>
        <div className="text-lg font-semibold mb-2">Lot Progress</div>
        <div className="grid md:grid-cols-2 gap-4">
          {data.lotProgress.map(l => (
            <div key={l.id} className="border rounded p-4">
              <div className="font-medium">{l.lot_number}</div>
              <div className="text-sm text-gray-500">Target: {l.target_qty || '—'}</div>
              <div className="mt-2">Produced: <b>{l.produced}</b></div>
              {l.target_qty ? (<div className="w-full bg-gray-200 rounded h-2 mt-2"><div className="bg-black h-2 rounded" style={{ width: `${Math.min(100, (l.produced/(l.target_qty||1))*100)}%` }} /></div>) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
