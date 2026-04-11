import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Home() {
  // Traemos todos los listings con algunas relaciones útiles
  const listings = await prisma.listing.findMany({
    include: {
      brand: true,           // si tenés relación con Brand
      images: true,          // si ListingImage está relacionado como "images"
      user: true,            // el usuario que publicó el listing
    },
    orderBy: {
      createdAt: 'desc',     // los más nuevos primero
    },
    take: 20,                // limitamos a 20 para no saturar al principio
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-10">
          Listings Disponibles
        </h1>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Todavía no hay listings cargados.</p>
            <p className="text-sm text-gray-400 mt-2">Crea algunos desde Prisma Studio o desde la app.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                {/* Imagen principal */}
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
                  <h2 className="font-semibold text-lg line-clamp-2">
                    {listing.title}
                  </h2>

                  {listing.brand && (
                    <p className="text-sm text-gray-500 mt-1">
                      {listing.brand.name}
                    </p>
                  )}

                  <p className="text-2xl font-bold text-green-600 mt-3">
                    ${listing.price?.toLocaleString() || 'Precio no disponible'}
                  </p>

                  <div className="mt-4 text-xs text-gray-400">
                    Publicado por {listing.user?.name || 'Usuario desconocido'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}