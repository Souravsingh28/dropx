// client/src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { imgUrl, initials } from '../lib/img';


function FieldRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-sm font-medium text-right break-all">{value ?? '—'}</div>
    </div>
  );
}

export default function Profile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/me');
      setMe(data);
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-4 shadow-sm">
          <div className="h-4 w-28 rounded bg-gray-200 mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border bg-white shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-4">
           ...

<img
  src={imgUrl(me.photo_url)}
  onError={(e)=>{ e.currentTarget.style.display='none'; /* show fallback below */ }}
  alt=""
  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border"
/>

{/* Fallback avatar if image missing or failed */}
{!me?.photo_url && (
  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border grid place-items-center bg-gray-100 text-gray-700 font-semibold">
    {initials(me.name)}
  </div>
)}
          <div>
            <div className="text-xl font-semibold">{me.name || '—'}</div>
            <div className="text-sm text-gray-500">{me.role?.toUpperCase()}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-sm font-semibold mb-2">Basic</div>
            <FieldRow label="ID Number (username)" value={me.id_number} />
            <FieldRow label="Phone" value={me.phone} />
            <FieldRow label="Gender" value={me.gender} />
            <FieldRow label="Age" value={me.age} />
            <FieldRow label="Date of Joining" value={me.date_of_joining} />
            <FieldRow label="Active" value={me.is_active ? 'Yes' : 'No'} />
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm font-semibold mb-2">Bank details</div>
            <FieldRow label="Account Number" value={me.bank_account} />
            <FieldRow label="IFSC" value={me.ifsc} />
          </div>
        </div>

        {/* Optional: quick self-edit (safe fields). Uncomment if needed.
        <div className="mt-4">
          <button
            className="border px-4 py-2.5 rounded-lg"
            onClick={()=>alert('Editing can be enabled. Ask me to add it!')}
          >Edit profile</button>
        </div>
        */}
      </div>
    </div>
  );
}
