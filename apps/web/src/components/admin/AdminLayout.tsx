'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api-client';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    authAPI.getMe()
      .then(response => {
        const data = response.data;
        if (data.role !== 'ADMIN' && data.role !== 'COMMUNITY_MANAGER') {
          router.push('/dashboard');
          return;
        }
        setUser(data);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: '📊',
      allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'],
    },
    {
      name: 'Prenotazioni',
      href: '/admin/bookings',
      icon: '📅',
      allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'],
    },
    {
      name: 'Risorse',
      href: '/admin/resources',
      icon: '🏢',
      allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'],
    },
    {
      name: 'Utenti',
      href: '/admin/users',
      icon: '👥',
      allowedRoles: ['ADMIN'],
    },
    {
      name: 'Pagamenti',
      href: '/admin/payments',
      icon: '💳',
      allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'],
    },
    {
      name: 'Calendario',
      href: '/admin/calendar',
      icon: '📆',
      allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'],
    },
    {
      name: 'Report',
      href: '/admin/reports',
      icon: '📈',
      allowedRoles: ['ADMIN'],
    },
  ];

  const filteredNavigation = navigation.filter(item =>
    user ? item.allowedRoles.includes(user.role) : false
  );

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-primary border-b border-primary z-20">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-primary/80 rounded-lg text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/admin" className="flex items-center">
              <Image
                src="/BALENO-LOGO-BIANCO.png"
                alt="Baleno Sanzeno"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-white/80 hover:text-white"
            >
              Vista Utente
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-white/70">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-accent text-primary px-4 py-2 rounded-lg hover:bg-accent/90 transition text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Baleno Booking System v1.0
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-16 ${
          sidebarOpen ? 'pl-64' : 'pl-0'
        }`}
      >
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
