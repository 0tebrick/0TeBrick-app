import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/resultados?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl flex gap-4 justify-center">
  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Buscar por nombre o número..."
    className="flex-grow px-6 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
  <button
    type="submit"
    className="bg-blue-500 text-white px-6 py-3 border border-gray-300 rounded-full hover:bg-blue-600 transition text-lg"
  >
    Buscar
  </button>
</form>

  );
}
