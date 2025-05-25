// frontend/src/pages/Resultados.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Hook to read URL parameters
import SearchBar from "../components/SearchBar"; // Assuming SearchBar is in components
import SetDetail from "../components/SetDetail"; // Assuming SetDetail is in components

export default function Resultados() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q"); // Gets the 'q' parameter from the URL

  const [bricklinkSetData, setBricklinkSetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // For saving status to DB

  // useEffect to fetch data when the component mounts or 'query' changes
  useEffect(() => {
    const fetchBricklinkData = async () => {
      if (!query) {
        setError("No se ha proporcionado un término de búsqueda.");
        setLoading(false);
        setBricklinkSetData(null);
        return;
      }

      setLoading(true);
      setError(null);
      setSaveStatus(null); // Clear save status for new search
      setBricklinkSetData(null); // Clear previous results

      try {
        // --- IMPORTANT: Ensure this URL matches your backend's BrickLink API route ---
        // Based on our previous discussion, this should be the correct path.
        const response = await fetch(`http://localhost:4000/api/bricklink/set/${query}`);

        if (!response.ok) {
          // If the backend returns a non-200 status (e.g., 404, 500)
          const errorData = await response.json();
          throw new Error(errorData.message || `Error HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Datos de BrickLink recibidos del BACKEND:", data);

        // --- Map BrickLink API data to SetDetail component's expected props ---
        // Based on the fields you used in SetDetail.jsx
        const mappedData = {
          name: data.name,
          set_num: data.no,       // BrickLink uses 'no' for set number
          pieces: data.num_parts, // BrickLink uses 'num_parts'
          year: data.year,
          theme: data.category,   // BrickLink uses 'category' for the theme
          img_url: data.image_url, // BrickLink uses 'image_url'
          set_id: data.no,        // Use BrickLink's set number as a unique ID
          price_estimated: data.retail_price || null, // Or other price field from BrickLink if available
        };

        setBricklinkSetData(mappedData);
      } catch (err) {
        console.error("Error al buscar en BrickLink:", err);
        setError(`No se pudo encontrar el set o hubo un error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBricklinkData();
  }, [query]); // Re-run effect if the 'query' in the URL changes

  // Function to handle saving the set to your collection (passed to SetDetail)
  const handleSaveSet = async (newSetData) => {
    setSaveStatus("Guardando...");
    setError(null); // Clear previous errors

    try {
      // Endpoint for saving the set to your collection in your SQLite DB
      const response = await fetch('http://localhost:4000/api/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al guardar el set: ${response.status} ${response.statusText}`);
      }

      const savedSet = await response.json();
      console.log('Set guardado exitosamente:', savedSet);
      setSaveStatus("¡Set guardado exitosamente!");
      // Optionally, navigate to a collection page or clear the form
    } catch (err) {
      console.error('Error al guardar el set:', err);
      setSaveStatus(null);
      setError(`No se pudo guardar el set: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-xl mb-8 mt-12">
        <SearchBar initialQuery={query} />
      </div>

      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Resultados para: "{query}"
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

      {saveStatus && (
        <p className={`text-lg font-semibold mt-4 ${saveStatus.includes('exitosamente') ? 'text-green-600' : 'text-orange-600'}`}>
          {saveStatus}
        </p>
      )}

      {/* Render SetDetail only if data is loaded and no error */}
      {!loading && !error && bricklinkSetData ? (
        <SetDetail setData={bricklinkSetData} onSave={handleSaveSet} />
      ) : (
        !loading && !error && query && <p className="text-gray-600 text-lg mt-8">No se encontraron resultados para "{query}".</p>
      )}
    </div>
  );
}