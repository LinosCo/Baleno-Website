'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    fetch('http://localhost:4000/api/reports/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Caricamento report...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report & Analytics</h1>
          <p className="text-gray-600 mt-1">Statistiche dettagliate del sistema</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">Prenotazioni Totali</p>
            <p className="text-4xl font-bold mt-2">{stats?.totalBookings || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">Entrate Totali</p>
            <p className="text-4xl font-bold mt-2">€{stats?.totalRevenue || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">Utenti Registrati</p>
            <p className="text-4xl font-bold mt-2">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">Risorse Attive</p>
            <p className="text-4xl font-bold mt-2">{stats?.totalResources || 0}</p>
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Stato Prenotazioni</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">In Attesa</span>
                <span className="text-lg font-bold text-yellow-600">{stats?.pendingBookings || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${((stats?.pendingBookings || 0) / (stats?.totalBookings || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Approvate</span>
                <span className="text-lg font-bold text-green-600">{stats?.approvedBookings || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${((stats?.approvedBookings || 0) / (stats?.totalBookings || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Rifiutate</span>
                <span className="text-lg font-bold text-red-600">{stats?.rejectedBookings || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${((stats?.rejectedBookings || 0) / (stats?.totalBookings || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Completate</span>
                <span className="text-lg font-bold text-blue-600">{stats?.completedBookings || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${((stats?.completedBookings || 0) / (stats?.totalBookings || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tasso di Approvazione</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.totalBookings
                ? Math.round(((stats?.approvedBookings || 0) / stats.totalBookings) * 100)
                : 0}
              %
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Entrate Medie/Prenotazione</h3>
            <p className="text-3xl font-bold text-blue-600">
              €
              {stats?.totalBookings && stats?.totalRevenue
                ? (stats.totalRevenue / stats.totalBookings).toFixed(2)
                : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Utilizzo Risorse</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.totalResources && stats?.totalBookings
                ? (stats.totalBookings / stats.totalResources).toFixed(1)
                : 0}
              <span className="text-lg text-gray-500">/risorsa</span>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Analytics Avanzate</h3>
          <p className="text-sm text-blue-800">
            Questa sezione fornisce una panoramica delle metriche chiave del sistema. Per report più dettagliati,
            esporta i dati tramite le API o integra strumenti di analytics esterni.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
