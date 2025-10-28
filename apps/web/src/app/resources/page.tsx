'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  isActive: boolean;
  images: string[];
  amenities: string[];
  location?: string;
}

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:4000/api/resources', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Errore nel caricamento delle risorse');
        setLoading(false);
      });
  }, [router]);

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
            <h1 className="text-2xl font-bold text-gray-900">Risorse Disponibili</h1>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Torna alla dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {resources.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <p className="text-lg text-gray-600">Nessuna risorsa disponibile al momento</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map(resource => (
                <div
                  key={resource.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-6xl">
                      {resource.type === 'ROOM' && '🏠'}
                      {resource.type === 'EQUIPMENT' && '⚙️'}
                      {resource.type === 'SPACE' && '📍'}
                      {resource.type === 'VEHICLE' && '🚗'}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{resource.name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          resource.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {resource.isActive ? 'DISPONIBILE' : 'NON DISPONIBILE'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{resource.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="ml-2 font-medium">{resource.type}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">Capacità:</span>
                        <span className="ml-2 font-medium">{resource.capacity} persone</span>
                      </div>
                      {resource.location && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-600">Posizione:</span>
                          <span className="ml-2 font-medium">{resource.location}</span>
                        </div>
                      )}
                    </div>

                    {resource.amenities && resource.amenities.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Caratteristiche:</p>
                        <div className="flex flex-wrap gap-2">
                          {resource.amenities.map((amenity, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            €{resource.pricePerHour}
                          </p>
                          <p className="text-xs text-gray-500">per ora</p>
                        </div>
                        {resource.isActive && (
                          <Link
                            href={`/bookings/new?resourceId=${resource.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                          >
                            Prenota
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
