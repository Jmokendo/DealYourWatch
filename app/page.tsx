"use client";

import { useEffect, useState } from "react";

type Listing = {
  id: string;
  title: string;
  price: number;
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Watchs Marketplace</h1>

      {listings.length === 0 ? (
        <p>No hay relojes todavía...</p>
      ) : (
        listings.map((listing) => (
          <div key={listing.id} style={{ marginBottom: 20 }}>
            <h2>{listing.title}</h2>
            <p>${listing.price}</p>
          </div>
        ))
      )}
    </div>
  );
}