'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  totalRevenue: number;
  totalUsers: number;
  totalResources: number;
  recentBookings: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    // Fetch dashboard stats
    Promise.all([
      fetch('http://localhost:4000/api/reports/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => res.json()),
      fetch('http://localhost:4000/api/bookings?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => res.json()),
    ])
      .then(([dashboardData, recentBookings]) => {
        setStats({
          ...dashboardData,
          recentBookings,
        });
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
          <div className="text-xl">Caricamento statistiche...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Panoramica del sistema di prenotazione</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Prenotazioni Totali"
            value={stats?.totalBookings || 0}
            icon="📅"
            color="blue"
          />
          <StatCard
            title="In Attesa"
            value={stats?.pendingBookings || 0}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Approvate"
            value={stats?.approvedBookings || 0}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Entrate Totali"
            value={`€${stats?.totalRevenue || 0}`}
            icon="💰"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Utenti Registrati"
            value={stats?.totalUsers || 0}
            icon="👥"
            color="indigo"
          />
          <StatCard
            title="Risorse Disponibili"
            value={stats?.totalResources || 0}
            icon="🏢"
            color="pink"
          />
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Prenotazioni Recenti</h2>
          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
            <div className="space-y-3">
              {stats.recentBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{booking.title}</p>
                    <p className="text-sm text-gray-600">
                      {booking.user.firstName} {booking.user.lastName} - {booking.resource.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.startTime).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nessuna prenotazione recente</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Modera Prenotazioni"
            description="Approva o rifiuta le prenotazioni in attesa"
            href="/admin/bookings"
            icon="✅"
          />
          <QuickActionCard
            title="Gestisci Risorse"
            description="Aggiungi, modifica o rimuovi risorse"
            href="/admin/resources"
            icon="🏢"
          />
          <QuickActionCard
            title="Visualizza Report"
            description="Analizza statistiche e report dettagliati"
            href="/admin/reports"
            icon="📈"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <a
      href={href}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}
