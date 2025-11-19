'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, Shield, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-vh-100">
      {/* Enhanced Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-lg" style={{ padding: '1rem 0' }}>
        <div className="container">
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <Image
              src="/BALENO-LOGO-BIANCO.png"
              alt="Baleno San Zeno"
              width={200}
              height={65}
              className="d-inline-block"
              style={{ height: '65px', width: 'auto' }}
              priority
            />
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <div className="navbar-nav ms-auto d-flex align-items-lg-center gap-3">
              <div className="d-flex gap-2 mt-3 mt-lg-0">
                <Link href="/login" className="btn btn-outline-light px-4">
                  Accedi
                </Link>
                <Link href="/register" className="btn btn-light text-primary fw-semibold px-4">
                  Registrati
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section position-relative overflow-hidden" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="hero-gradient"></div>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className={`display-3 fw-bold mb-4 text-baleno-primary ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
                Baleno San Zeno
              </h1>
              <p className={`lead fs-3 text-secondary mb-5 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
                Sistema completo di gestione e prenotazione spazi per la Casa di Quartiere
              </p>
              <div className={`d-flex gap-3 justify-content-center flex-wrap ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
                <Link href="/resources" className="btn btn-primary btn-lg cta-button">
                  Esplora Spazi
                </Link>
                <Link href="/calendar" className="btn btn-outline-primary btn-lg cta-button">
                  Vedi Calendario
                </Link>
                <Link href="/bookings/new" className="btn btn-success btn-lg cta-button">
                  Prenota Ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className={`text-center display-5 fw-bold mb-5 text-baleno-primary ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Funzionalità Principali
          </h2>
          <div className="row g-4">
            <div className={`col-md-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <FeatureCard
                icon={<Calendar className="text-primary" size={48} />}
                title="Prenotazioni Facili"
                description="Sistema di prenotazione intuitivo con calendario in tempo reale"
              />
            </div>
            <div className={`col-md-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <FeatureCard
                icon={<CreditCard className="text-primary" size={48} />}
                title="Pagamenti Sicuri"
                description="Integrazione Stripe per pagamenti sicuri e ricevute automatiche"
              />
            </div>
            <div className={`col-md-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <FeatureCard
                icon={<Shield className="text-primary" size={48} />}
                title="Gestione Avanzata"
                description="Dashboard completa per admin e community manager"
              />
            </div>
            <div className={`col-md-6 col-lg-3 ${mounted ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <FeatureCard
                icon={<Users className="text-primary" size={48} />}
                title="Calendario Pubblico"
                description="Visualizza tutte le prenotazioni approvate in tempo reale"
              />
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        /* Animazioni */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .opacity-0 {
          opacity: 0;
        }

        /* Hero Gradient Animato */
        .hero-section {
          background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #f0f4f8 100%);
          position: relative;
        }

        .hero-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            rgba(43, 84, 142, 0.03) 0%,
            rgba(237, 187, 0, 0.03) 50%,
            rgba(43, 84, 142, 0.03) 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          z-index: 0;
        }

        /* Bottoni CTA con hover effect */
        .cta-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(0);
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .cta-button:active {
          transform: translateY(-1px);
        }

        /* Feature Cards con hover effect migliorato */
        .feature-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(0);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(43, 84, 142, 0.15);
          border-color: rgba(43, 84, 142, 0.2);
        }

        .feature-card .icon-wrapper {
          transition: transform 0.3s ease;
        }

        .feature-card:hover .icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        /* Navbar con effetto blur */
        .navbar {
          backdrop-filter: blur(10px);
          background-color: rgba(43, 84, 142, 0.95) !important;
          transition: all 0.3s ease;
        }
      `}</style>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card h-100 shadow-sm feature-card">
      <div className="card-body text-center d-flex flex-column p-4">
        <div className="icon-wrapper mb-4">{icon}</div>
        <h3 className="card-title h5 fw-semibold mb-3 text-baleno-primary">{title}</h3>
        <p className="card-text text-muted mb-0">{description}</p>
      </div>
    </div>
  );
}
