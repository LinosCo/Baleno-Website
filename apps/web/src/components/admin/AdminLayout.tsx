'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI } from '../../lib/api-client';

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
    { name: 'Dashboard', href: '/admin', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Prenotazioni', href: '/admin/bookings', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Risorse', href: '/admin/resources', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Utenti', href: '/admin/users', allowedRoles: ['ADMIN'] },
    { name: 'Pagamenti', href: '/admin/payments', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Calendario', href: '/admin/calendar', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Report', href: '/admin/reports', allowedRoles: ['ADMIN'] },
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
      <nav className="navbar navbar-dark bg-primary fixed-top shadow-lg" style={{ zIndex: 1030, padding: '1rem 0' }}>
        <div className="container-fluid px-4 position-relative">
          <button
            className="btn btn-link text-white p-0"
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/admin" className="position-absolute start-50 translate-middle-x navbar-brand mb-0">
            <Image
              src="/BALENO-LOGO-BIANCO.png"
              alt="Baleno Sanzeno"
              width={200}
              height={65}
              style={{ height: '55px', width: 'auto' }}
              priority
            />
          </Link>

          <div className="d-flex align-items-center gap-3 ms-auto">
            <div className="text-end d-none d-md-block">
              <div className="text-white fw-semibold" style={{ fontSize: '0.95rem' }}>
                {user.firstName} {user.lastName}
              </div>
              <div className="text-white-50" style={{ fontSize: '0.8rem' }}>
                {user.role}
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-light text-primary fw-semibold px-4">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="d-flex" style={{ marginTop: '88px' }}>
        <div
          className={`bg-white border-end shadow-sm transition-all ${
            sidebarOpen ? 'd-block' : 'd-none'
          }`}
          style={{
            width: sidebarOpen ? '250px' : '0',
            minHeight: 'calc(100vh - 88px)',
            transition: 'width 0.3s ease',
            position: 'sticky',
            top: '88px',
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
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <main
          className="flex-grow-1 p-4"
          style={{
            backgroundColor: '#f8f9fa',
            minHeight: 'calc(100vh - 88px)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
