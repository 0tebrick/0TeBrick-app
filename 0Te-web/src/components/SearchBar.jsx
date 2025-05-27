import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function SearchBar({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // ⭐ Sincronizar query con initialQuery cada vez que cambie
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/resultados?q=${encodeURIComponent(query.trim())}`);
      setQuery("")
    }
  };

// Función para limpiar el input
  const handleClearSearch = () => {
    setQuery(''); // Borra el contenido del estado 'query'
    if (inputRef.current) {
      inputRef.current.focus(); // Opcional: vuelve a poner el foco en el input
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl flex gap-4 justify-center mx-auto relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o número..."
        className="flex-grow px-6 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
        autoComplete="off"
      />
      {/* Botón para limpiar la búsqueda (la "x") */}
      {query && ( // Solo renderiza si 'query' tiene contenido
        <button
          type="button" // Importante: type="button" para que no envíe el formulario
          onClick={handleClearSearch}
          className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full" // Ajusta right y otros estilos
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon className="h-5 w-5" /> {/* Usa el icono XMarkIcon */}
        </button>
      )}

      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-3 border border-gray-300 rounded-full hover:bg-blue-600 transition text-lg flex items-center justify-center">
        <MagnifyingGlassIcon className="h-5 w-5"/>
      </button>
    </form>
  );
}
