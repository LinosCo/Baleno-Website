'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api-client';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Fetch user data
    authAPI.getMe()
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Baleno Booking</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Dashboard
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">👤 Profilo</h3>
              <p className="text-gray-600 text-sm mb-4">
                Email: {user?.email}
              </p>
              <p className="text-gray-600 text-sm">
                Ruolo: <span className="font-semibold">{user?.role}</span>
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">📅 Prenotazioni</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-gray-600 text-sm mt-2">Nessuna prenotazione attiva</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">💳 Pagamenti</h3>
              <p className="text-3xl font-bold text-green-600">€0</p>
              <p className="text-gray-600 text-sm mt-2">Totale speso</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-6">Azioni Rapide</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/bookings/new"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
              >
                <div className="text-3xl mb-2">➕</div>
                <div className="font-medium">Nuova Prenotazione</div>
              </Link>

              <Link
                href="/resources"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
              >
                <div className="text-3xl mb-2">🏢</div>
                <div className="font-medium">Visualizza Risorse</div>
              </Link>

              <Link
                href="/bookings"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
              >
                <div className="text-3xl mb-2">📋</div>
                <div className="font-medium">Le Mie Prenotazioni</div>
              </Link>

              <Link
                href="/profile"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
              >
                <div className="text-3xl mb-2">⚙️</div>
                <div className="font-medium">Impostazioni</div>
              </Link>
            </div>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">
                🔧 Pannello Amministratore
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/admin/users"
                  className="bg-white p-4 rounded-lg hover:shadow-md transition"
                >
                  <div className="font-medium">Gestione Utenti</div>
                </Link>
                <Link
                  href="/admin/resources"
                  className="bg-white p-4 rounded-lg hover:shadow-md transition"
                >
                  <div className="font-medium">Gestione Risorse</div>
                </Link>
                <Link
                  href="/admin/reports"
                  className="bg-white p-4 rounded-lg hover:shadow-md transition"
                >
                  <div className="font-medium">Report & Analytics</div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
