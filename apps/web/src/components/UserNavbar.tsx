'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '../lib/api-client';

export default function UserNavbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authAPI.getMe()
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // Silently fail - user not logged in
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="navbar navbar-dark bg-primary shadow-sm sticky-top" style={{ padding: '1rem 0' }}>
      <div className="container-fluid px-4">
        <Link href="/dashboard" className="navbar-brand d-flex align-items-center">
          <Image
            src="/BALENO-LOGO-BIANCO.png"
            alt="Baleno San Zeno"
            width={200}
            height={65}
            style={{ height: '50px', width: 'auto' }}
            priority
          />
        </Link>
        <div className="d-flex align-items-center gap-3">
          {user && (
            <>
              <Link
                href="/dashboard"
                className="btn btn-outline-light btn-sm fw-semibold d-none d-md-inline-flex align-items-center gap-2"
                style={{ borderWidth: '1.5px' }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                </svg>
                Dashboard
              </Link>
              <span className="text-white d-none d-lg-inline fw-semibold" style={{ fontSize: '0.95rem' }}>
                {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-light text-primary fw-semibold px-4 d-inline-flex align-items-center gap-2"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
