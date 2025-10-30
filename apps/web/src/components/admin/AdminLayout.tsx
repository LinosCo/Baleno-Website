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
    { name: 'Dashboard', href: '/admin', icon: '=Ê', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Prenotazioni', href: '/admin/bookings', icon: '=Å', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Risorse', href: '/admin/resources', icon: '<â', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Utenti', href: '/admin/users', icon: '=e', allowedRoles: ['ADMIN'] },
    { name: 'Pagamenti', href: '/admin/payments', icon: '=³', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Calendario', href: '/admin/calendar', icon: '=Æ', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Report', href: '/admin/reports', icon: '=È', allowedRoles: ['ADMIN'] },
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
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary fixed-top shadow-sm" style={{ zIndex: 1030 }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-link text-white p-0"
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/admin" className="navbar-brand mb-0">
              <Image
                src="/BALENO-LOGO-BIANCO.png"
                alt="Baleno Sanzeno"
                width={120}
                height={40}
                style={{ height: '32px', width: 'auto' }}
              />
            </Link>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link href="/dashboard" className="btn btn-sm btn-outline-light d-none d-md-block">
              Vista Utente
            </Link>
            <div className="d-flex align-items-center gap-2">
              <div className="text-end d-none d-md-block">
                <div className="text-white small fw-semibold">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                  {user.role}
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex" style={{ marginTop: '56px' }}>
        <div
          className={`bg-white border-end shadow-sm transition-all ${
            sidebarOpen ? 'd-block' : 'd-none'
          }`}
          style={{
            width: sidebarOpen ? '250px' : '0',
            minHeight: 'calc(100vh - 56px)',
            transition: 'width 0.3s ease',
            position: 'sticky',
            top: '56px',
            alignSelf: 'flex-start',
          }}
        >
          <nav className="p-3">
            <ul className="nav flex-column">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li className="nav-item mb-1" key={item.href}>
                    <Link
                      href={item.href}
                      className={`nav-link d-flex align-items-center gap-2 rounded ${
                        isActive
                          ? 'bg-primary text-white fw-semibold'
                          : 'text-dark'
                      }`}
                      style={{ padding: '0.75rem 1rem' }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="position-absolute bottom-0 start-0 end-0 p-3 border-top">
            <div className="text-center text-muted small">
              <div>Baleno Booking System</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                v1.0 - Lino's & Co
              </div>
            </div>
          </div>
        </div>

        <main
          className="flex-grow-1 p-4"
          style={{
            backgroundColor: '#f8f9fa',
            minHeight: 'calc(100vh - 56px)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
