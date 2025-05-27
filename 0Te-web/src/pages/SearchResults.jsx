// src/pages/SearchResults.jsx
/*import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchBricklinkData = async () => {
      if (!query) {
        setError("No se ha proporcionado un término de búsqueda.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch(
          `https://zerotebrick-backend.onrender.com/api/bricklink/set/${query}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Error HTTP: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data && data.no) {
          setResult(data);
        } else {
          setError("No se encontró el set para la búsqueda: " + query);
        }
      } catch (err) {
        setError(`No se pudo encontrar el set: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBricklinkData();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-xl mb-8 mt-12">
        <SearchBar initialQuery={query} />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Buscando resultados para: "{query}"
      </h2>

      {loading && (
        <div className="text-blue-600 text-xl flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando...
        </div>
      )}

      {error && <p className="text-red-600 text-lg">{error}</p>}

      {!loading && result && (
        <div className="bg-white shadow rounded p-4 mt-6 max-w-xl w-full text-left">
          <h3 className="text-xl font-bold text-blue-700">
            {result.name} ({result.no})
          </h3>
          <p className="text-gray-700">
            Año: {result.year} | Piezas: {result.num_parts}
          </p>
          <img
            src={result.image_url}
            alt={result.name}
            className="w-48 h-auto my-4"
          />
          <a
            href={`/detalle/${result.no}`}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Ver detalles
          </a>
        </div>
      )}
    </div>
  );
}*/

import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchBricklinkData = async () => {
      if (!query) {
        setError("No se ha proporcionado un término de búsqueda.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch(
          `https://zerotebrick-backend.onrender.com/api/bricklink/set/${query}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
            `Error HTTP: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data && data.no) {
          setResult(data);
        } else {
          setError("No se encontró el set para la búsqueda: " + query);
        }
      } catch (err) {
        setError(`No se pudo encontrar el set: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBricklinkData();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-xl mb-8 mt-12">
        <SearchBar initialQuery={query} />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Buscando resultados para: "{query}"
      </h2>

      {loading && (
        <div className="text-blue-600 text-xl flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando...
        </div>
      )}

      {error && <p className="text-red-600 text-lg">{error}</p>}

      {!loading && result && (
        <div className="bg-white shadow rounded p-4 mt-6 max-w-xl w-full text-left">
          <h3 className="text-xl font-bold text-blue-700">
            {result.name} ({result.no})
          </h3>
          <img
            src={result.image_url}
            alt={result.name}
            className="w-48 h-auto my-4"
          />
          <Link
            to={`/detalle/${result.no}`}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Ver detalles
          </Link>
        </div>
      )}
    </div>
  );
}
