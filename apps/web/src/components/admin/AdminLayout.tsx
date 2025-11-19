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
    { name: 'Impostazioni Pagamento', href: '/admin/payment-settings', allowedRoles: ['ADMIN'] },
    { name: 'Bonifici Bancari', href: '/admin/bank-transfers', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Calendario', href: '/admin/calendar', allowedRoles: ['ADMIN', 'COMMUNITY_MANAGER'] },
    { name: 'Report', href: '/admin/reports', allowedRoles: ['ADMIN'] },
    { name: 'Audit Logs', href: '/admin/audit-logs', allowedRoles: ['ADMIN'] },
  ];

  const filteredNavigation = navigation.filter(item =>
    user ? item.allowedRoles.includes(user.role) : false
  );

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
    <div className="min-vh-100" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%)'
    }}>
      <nav className="navbar navbar-dark fixed-top shadow-sm" style={{
        zIndex: 1030,
        padding: '0.75rem 0',
        background: 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)'
      }}>
        <div className="container-fluid px-4 position-relative">
          <button
            className="btn btn-link text-white p-0"
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            style={{
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/admin" className="position-absolute start-50 translate-middle-x navbar-brand mb-0">
            <Image
              src="/BALENO-LOGO-BIANCO.png"
              alt="Baleno San Zeno"
              width={160}
              height={52}
              style={{ height: '45px', width: 'auto' }}
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
            <button
              onClick={handleLogout}
              className="btn fw-semibold px-4"
              style={{
                background: 'white',
                color: '#2B548E',
                border: 'none',
                borderRadius: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#EDBB00';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 187, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#2B548E';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="d-flex" style={{ marginTop: '70px' }}>
        <div
          className={`bg-white transition-all ${
            sidebarOpen ? 'd-block' : 'd-none'
          }`}
          style={{
            width: sidebarOpen ? '250px' : '0',
            minHeight: 'calc(100vh - 70px)',
            transition: 'width 0.3s ease',
            position: 'sticky',
            top: '70px',
            alignSelf: 'flex-start',
            borderRight: '1px solid rgba(43, 84, 142, 0.1)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
          }}
        >
          <nav className="p-3">
            <ul className="nav flex-column">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li className="nav-item mb-2" key={item.href}>
                    <Link
                      href={item.href}
                      className="nav-link d-flex align-items-center gap-2 text-decoration-none"
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: isActive
                          ? 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)'
                          : 'transparent',
                        color: isActive ? 'white' : '#495057',
                        fontWeight: isActive ? '600' : '500',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 4px 12px rgba(43, 84, 142, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(43, 84, 142, 0.05)';
                          e.currentTarget.style.color = '#2B548E';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#495057';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
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
          className="flex-grow-1 px-4 py-4"
          style={{
            minHeight: 'calc(100vh - 70px)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
