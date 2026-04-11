'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Listing = {
  id: string;
  title: string;
  price: string;
  images: { url: string }[];
  model?: { brand?: { name: string } };
  user?: { name?: string };
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchListings() {
    const res = await fetch('/api/listings');
    const data = await res.json();
    setListings(data);
  }

  useEffect(() => {
    fetchListings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        const form = new FormData();
        form.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        if (!uploadRes.ok) {
          console.error('Error al subir imagen');
          return;
        }
        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price: parseFloat(price), userEmail, imageUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Error al crear listing:', err.error);
      } else {
        setTitle('');
        setPrice('');
        setUserEmail('');
        setImageFile(null);
        await fetchListings();
      }
    } catch (err) {
      console.error('Error de red:', err);
    } finally {
      setLoading(false);
    }
  } A

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-10">Listings Disponibles</h1>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-10 flex flex-col gap-4 max-w-md mx-auto">
          <h2 className="text-lg font-semibold">Crear nuevo listing</h2>
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Precio (USD)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Tu email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear listing'}
          </button>
        </form>

        {/* Lista */}
        {listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Todavía no hay listings cargados.</p>
            <p className="text-sm text-gray-400 mt-2">Usá el formulario de arriba para crear el primero.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}

                <div className="p-5">
                  <h2 className="font-semibold text-lg line-clamp-2">{listing.title}</h2>

                  {listing.model?.brand && (
                    <p className="text-sm text-gray-500 mt-1">{listing.model.brand.name}</p>
                  )}

                  <p className="text-2xl font-bold text-green-600 mt-3">
                    ${parseFloat(listing.price).toLocaleString()}
                  </p>

                  <div className="mt-4 text-xs text-gray-400">
                    Publicado por {listing.user?.name || 'Usuario desconocido'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
