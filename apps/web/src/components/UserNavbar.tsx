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
        <Link href={user ? "/dashboard" : "/"} className="navbar-brand d-flex align-items-center">
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
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="btn btn-outline-light btn-sm fw-semibold d-none d-md-inline-flex align-items-center gap-2"
                style={{ borderWidth: '1.5px' }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                </svg>
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-link text-white p-0 text-decoration-none d-flex flex-column align-items-center"
                style={{ minWidth: '80px' }}
              >
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16" className="mb-1">
                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
                <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                  {user.firstName} {user.lastName}
                </span>
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="btn btn-outline-light fw-semibold d-inline-flex align-items-center gap-2"
              style={{ borderWidth: '1.5px' }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
              Torna alla Home
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
