/**import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!query) return;

  setLoading(true);

  fetch(`http://localhost:4000/bricklink/set/${query}`)
    .then(res => res.json())
    .then(data => {
      if (data.data) {
        setResults([{
          setID: data.data.no,
          number: data.data.no,
          name: data.data.name,
          year: data.data.year_released,
          image: `https:${data.data.thumbnail_url}`
        }]);
      } else {
        setResults([]);
      }
    })
    .catch(err => {
      console.error("Error:", err);
      setResults([]);
    })
    .finally(() => setLoading(false));
}, [query]);


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Resultados para: "{query}"</h2>
      {loading ? (
        <p>Cargando resultados...</p>
      ) : results.length === 0 ? (
        <p>No se encontraron resultados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((set) => (
            <Link
              key={set.setID}
              to={`/detalle/${set.setID}`}
              className="border p-4 rounded hover:shadow-lg transition"
            >
              <img
                src={set.image}
                alt={set.name}
                className="h-32 object-contain mx-auto mb-2"
              />
              <h3 className="text-lg font-semibold">{set.name}</h3>
              <p className="text-sm text-gray-600">{set.number} - {set.year}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}*/

// frontend/src/pages/SearchResults.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // Import useNavigate
import SearchBar from "../components/SearchBar";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const navigate = useNavigate(); // Initialize navigate

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBricklinkData = async () => {
      if (!query) {
        setError("No se ha proporcionado un término de búsqueda.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // This call remains the same, fetching from your backend
        const response = await fetch(`https://zerotebrick-backend.onrender.com/api/bricklink/set/${query}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Datos de BrickLink recibidos del BACKEND en SearchResults:", data);

        // --- NEW LOGIC HERE ---
        // If data is received, immediately navigate to the SetDetail page
        // The SetDetail page will then fetch its own data using the setID
        if (data && data.no) { // Assuming 'no' is the unique identifier for the set
          navigate(`/detalle/${data.no}`); // Navigate to the detail page
        } else {
          setError("No se encontró el set para la búsqueda: " + query);
        }

      } catch (err) {
        console.error("Error al buscar en BrickLink desde SearchResults:", err);
        setError(`No se pudo encontrar el set o hubo un error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBricklinkData();
  }, [query, navigate]); // Add navigate to dependency array

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-xl mb-8 mt-12">
        {/* SearchBar here will allow new searches from the results page */}
        <SearchBar initialQuery={query} />
      </div>

      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Buscando resultados para: "{query}"
      </h2>

      {loading && (
        <div className="text-blue-600 text-xl flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      )}

      {error && (
        <p className="text-red-600 text-lg">{error}</p>
      )}

      {/* No direct rendering of SetDetail here anymore */}
      {!loading && !error && !query && <p className="text-gray-600 text-lg mt-8">Introduce un término de búsqueda para ver los resultados.</p>}
    </div>
  );
}