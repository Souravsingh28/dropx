import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NavItem({ to, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-3 py-2 rounded-lg text-sm transition
        ${active ? 'bg-gray-900 text-white' : 'text-gray-800 hover:bg-gray-100'}
      `}
    >
      {label}
    </Link>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Close the drawer after clicking a link on mobile
  const closeOnMobile = () => setOpen(false);

  return (
<div className="min-h-dvh bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto h-14 px-3 sm:px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <Link to="/dashboard" className="font-semibold tracking-tight">
              DropX
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile" className="hidden sm:inline text-sm hover:underline">
              Profile
            </Link>
            <span className="hidden md:inline text-sm text-gray-600">
              {user?.name ? `${user.name} · ` : ''}{user?.role?.toUpperCase()}
            </span>
            <button
              onClick={logout}
              className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex">
          {/* Sidebar (desktop) */}
          <aside className="hidden sm:block w-64 shrink-0 py-4 pr-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3">
                <div className="text-base font-semibold">Navigation</div>
                <div className="text-xs text-gray-500">Role: {user?.role}</div>
              </div>
              <nav className="space-y-1">
                <NavItem to="/dashboard" label="Dashboard" />
                {/* Everyone: Profile */}
                <NavItem to="/profile" label="Profile" />
                {/* Admin only */}
                {user.role === 'admin' && <NavItem to="/users" label="Users" />}
                {/* Admin + Incharge */}
                {(user.role === 'admin' || user.role === 'incharge') && (
                  <NavItem to="/employees" label="Employees" />
                )}
                {/* Not worker: lots & production */}
                {user.role !== 'worker' && <NavItem to="/lots" label="Lots & Ops" />}
                {user.role !== 'worker' && <NavItem to="/production" label="Production" />}
                {/* Admin + Incharge */}
                {(user.role === 'admin' || user.role === 'incharge') && (
                  <NavItem to="/salary" label="Salary" />
                )}
              </nav>
            </div>
          </aside>

          {/* Drawer (mobile) */}
          {open && (
            <>
              <div
                className="fixed inset-0 z-50 bg-black/40"
                onClick={() => setOpen(false)}
              />
              <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-lg font-semibold">DropX</div>
                    <div className="text-xs text-gray-500">Role: {user?.role}</div>
                  </div>
                  <button
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg border"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                  >
                    ✕
                  </button>
                </div>
                <nav className="space-y-1">
                  <NavItem to="/dashboard" label="Dashboard" onClick={closeOnMobile} />
                  <NavItem to="/profile" label="Profile" onClick={closeOnMobile} />
                  {user.role === 'admin' && (
                    <NavItem to="/users" label="Users" onClick={closeOnMobile} />
                  )}
                  {(user.role === 'admin' || user.role === 'incharge') && (
                    <NavItem to="/employees" label="Employees" onClick={closeOnMobile} />
                  )}
                  {user.role !== 'worker' && (
                    <NavItem to="/lots" label="Lots & Ops" onClick={closeOnMobile} />
                  )}
                  {user.role !== 'worker' && (
                    <NavItem to="/production" label="Production" onClick={closeOnMobile} />
                  )}
                  {(user.role === 'admin' || user.role === 'incharge') && (
                    <NavItem to="/salary" label="Salary" onClick={closeOnMobile} />
                  )}
                </nav>

                <div className="mt-6">
                  <button
                    onClick={() => { setOpen(false); logout(); }}
                    className="w-full text-sm border px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </aside>
            </>
          )}

          {/* Main content */}
          <main className="flex-1 py-4 sm:py-6">
            <div className="rounded-2xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
