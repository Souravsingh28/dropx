import { useEffect, useState } from 'react';
import api from '../lib/api';
import TableWrap from '../components/TableWrap';
import { imgUrl, initials } from '../lib/img';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    id_number: '',          // login username
    password: '',           // login password
    role: 'worker',
    name: '',
    age: '',
    gender: 'other',
    bank_account: '',
    ifsc: '',
    phone: '',
    date_of_joining: '',
    is_active: true,
    photo_url: ''           // will be filled after upload
  });

  const load = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
  };
  useEffect(() => { load(); }, []);

  // Upload photo to backend -> returns { url: "/uploads/filename.jpg" }
  const uploadPhoto = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.post('/upload/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.url;
    } finally {
      setUploading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    let photo_url = form.photo_url;

    if (photoFile) {
      photo_url = await uploadPhoto(photoFile);
    }

    await api.post('/users', {
      ...form,
      age: form.age ? Number(form.age) : null,
      photo_url
    });

    setForm({
      id_number: '',
      password: '',
      role: 'worker',
      name: '',
      age: '',
      gender: 'other',
      bank_account: '',
      ifsc: '',
      phone: '',
      date_of_joining: '',
      is_active: true,
      photo_url: ''
    });
    setPhotoFile(null);
    await load();
  };

  const updateUser = async (id, patch) => {
    await api.put(`/users/${id}`, patch);
    await load();
  };

  const changePassword = async (id) => {
    const pw = prompt('New password:');
    if (!pw) return;
    await api.put(`/users/${id}/password`, { new_password: pw });
    alert('Password updated');
  };

  const previewUrl = photoFile ? URL.createObjectURL(photoFile) : (form.photo_url || '');

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Create User */}
      <div>
        <div className="text-lg font-semibold mb-2">Create User</div>
        <form onSubmit={createUser} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <input
                className="w-full border p-2 rounded min-w-0"
                placeholder="ID Number (login)"
                value={form.id_number}
                onChange={e => setForm({ ...form, id_number: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <input
                className="w-full border p-2 rounded min-w-0"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div className="min-w-0">
            <input
              className="w-full border p-2 rounded min-w-0"
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="min-w-0">
              <input
                className="w-full border p-2 rounded min-w-0"
                placeholder="Age"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <select
                className="w-full border p-2 rounded min-w-0"
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
              >
                {['male', 'female', 'other'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="min-w-0">
              <select
                className="w-full border p-2 rounded min-w-0"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                {['admin', 'supervisor', 'incharge', 'worker'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <input
                className="w-full border p-2 rounded min-w-0"
                placeholder="Phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <input
                className="w-full border p-2 rounded min-w-0"
                placeholder="Account Number"
                value={form.bank_account}
                onChange={e => setForm({ ...form, bank_account: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <input
                className="w-full border p-2 rounded min-w-0"
                placeholder="IFSC Code"
                value={form.ifsc}
                onChange={e => setForm({ ...form, ifsc: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <input
                type="date"
                className="w-full border p-2 rounded min-w-0"
                value={form.date_of_joining}
                onChange={e => setForm({ ...form, date_of_joining: e.target.value })}
              />
            </div>
          </div>

          {/* Photo: upload or capture */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Photo (upload or take a new one)</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={e => setPhotoFile(e.target.files?.[0] || null)}
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className="h-20 w-20 object-cover rounded border"
              />
            ) : null}
            {uploading && <div className="text-xs text-gray-500">Uploading...</div>}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>

          <button className="bg-black text-white px-4 py-2 rounded" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save'}
          </button>

          <p className="text-xs text-gray-500">
            Note: For role <b>worker</b>, an Employee record is auto-created (emp_code = id_number).
          </p>
        </form>
      </div>

      {/* Users List */}
      <div>
        <div className="text-lg font-semibold mb-2">Users</div>

        {/* Mobile cards (no side scroll) */}
        <div className="space-y-3 sm:hidden">
          {users.map(u => (
            <div key={u.id} className="rounded-2xl border bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12">
  {u.photo_url ? (
    <img
      src={imgUrl(u.photo_url)}
      alt=""
      onError={(e)=>{ e.currentTarget.style.display='none'; }}
      className="h-12 w-12 rounded-full object-cover border"
    />
  ) : (
    <div className="h-12 w-12 rounded-full border grid place-items-center bg-gray-100 text-gray-700 text-sm font-semibold">
      {initials(u.name)}
    </div>
  )}
</div>

                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{u.name || '—'}</div>
                  <div className="text-xs text-gray-500 break-words">{u.id_number}</div>
                </div>
                <span className="ml-auto text-xs bg-gray-900 text-white rounded px-2 py-0.5">
                  {u.role}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-600">Phone</div>
                <div className="text-right break-words">{u.phone || '—'}</div>
                <div className="text-gray-600">Active</div>
                <div className="text-right">{u.is_active ? 'Yes' : 'No'}</div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <select
                  className="border p-2 rounded text-sm"
                  value={u.role}
                  onChange={e => updateUser(u.id, { role: e.target.value })}
                >
                  {['admin', 'supervisor', 'incharge', 'worker'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!u.is_active}
                    onChange={e => updateUser(u.id, { is_active: e.target.checked ? 1 : 0 })}
                  />
                  Active
                </label>
                <button
                  onClick={() => changePassword(u.id)}
                  className="ml-auto text-blue-600 text-sm"
                >
                  Change Password
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-sm text-gray-500">No users found</div>
          )}
        </div>

        {/* Desktop table (scrolls inside itself if needed) */}
        <div className="hidden sm:block">
          <TableWrap>
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border text-left">Photo</th>
                  <th className="p-2 border text-left">ID Number</th>
                  <th className="p-2 border text-left">Name</th>
                  <th className="p-2 border text-left">Role</th>
                  <th className="p-2 border text-left">Phone</th>
                  <th className="p-2 border text-left">Active</th>
                  <th className="p-2 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="odd:bg-white even:bg-gray-50">
                    <div className="relative h-12 w-12">
  {u.photo_url ? (
    <img
      src={imgUrl(u.photo_url)}
      alt=""
      onError={(e)=>{ e.currentTarget.style.display='none'; }}
      className="h-12 w-12 rounded-full object-cover border"
    />
  ) : (
    <div className="h-12 w-12 rounded-full border grid place-items-center bg-gray-100 text-gray-700 text-sm font-semibold">
      {initials(u.name)}
    </div>
  )}
</div>

                    <td className="p-2 border break-words">{u.id_number}</td>
                    <td className="p-2 border break-words">{u.name}</td>
                    <td className="p-2 border">
                      <select
                        className="border p-1 rounded"
                        value={u.role}
                        onChange={e => updateUser(u.id, { role: e.target.value })}
                      >
                        {['admin', 'supervisor', 'incharge', 'worker'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border break-words">{u.phone || ''}</td>
                    <td className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={!!u.is_active}
                        onChange={e => updateUser(u.id, { is_active: e.target.checked ? 1 : 0 })}
                      />
                    </td>
                    <td className="p-2 border">
                      <button onClick={() => changePassword(u.id)} className="text-blue-600">
                        Change Password
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrap>
        </div>
      </div>
    </div>
  );
}
