/**import React, { useState } from "react";

export default function SetDetail({ setData, onSave }) {
  // Campos que se llenan manualmente
  const [precioCompra, setPrecioCompra] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [estado, setEstado] = useState("activo");

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevoSet = {
      nombre: setData.name,
      numero: setData.set_num,
      piezas: setData.num_parts,
      ano: setData.year,
      tema: setData.theme,
      estado,
      precioCompra,
      fechaCompra,
      imagen: setData.img_url,
      setId: setData.set_id,
    };

    onSave(nuevoSet);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">{setData.name} ({setData.set_num})</h2>
      <img src={setData.img_url} alt={setData.name} className="w-64 h-auto mx-auto mb-4" />

      <ul className="text-gray-700 mb-6 space-y-1">
        <li><strong>Año:</strong> {setData.year}</li>
        <li><strong>Set ID:</strong> {setData.set_id}</li>
        <li><strong>Tema:</strong> {setData.theme}</li>
        <li><strong>Piezas:</strong> {setData.num_parts}</li>
        <li><strong>Precio estimado:</strong> {setData.price_estimated ?? "N/D"}</li>
      </ul>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Precio de compra (€)</label>
          <input
            type="number"
            step="0.01"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Fecha de compra</label>
          <input
            type="date"
            value={fechaCompra}
            onChange={(e) => setFechaCompra(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="activo">Activo</option>
            <option value="retirado">Retirado</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Agregar a mi colección
        </button>
      </form>
    </div>
  );
}*/

// frontend/src/pages/SetDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams

export default function SetDetail() {
  const { setID } = useParams(); // Get setID from the URL parameter

  const [setInfo, setSetInfo] = useState(null); // To store fetched set data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Form fields (user input)
  const [precioCompra, setPrecioCompra] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [estado, setEstado] = useState("activo");

  // Effect to fetch set data when the page loads or setID changes
  useEffect(() => {
    const fetchSetData = async () => {
      if (!setID) {
        setError("No se ha proporcionado un ID de set.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setSetInfo(null); // Clear previous set data

      try {
        // Fetch the specific set's data from your backend using the setID
        const response = await fetch(`http://localhost:4000/api/bricklink/set/${setID}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Datos de set recibidos en SetDetail:", data);

        // Map BrickLink API data to the format needed for display and saving
        const mappedData = {
          name: data.name,
          set_num: data.no,
          num_parts: data.num_parts,
          year: data.year,
          theme: data.category,
          img_url: data.image_url,
          set_id: data.no, // Use BrickLink's 'no' as the unique ID for your collection
          price_estimated: data.retail_price || null,
        };
        setSetInfo(mappedData);

        // Optional: Pre-fill form fields if you have default values or loaded data
        // For example, if you were editing an existing set from your collection
      } catch (err) {
        console.error("Error al cargar detalles del set:", err);
        setError(`No se pudo cargar la información del set: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSetData();
  }, [setID]); // Re-run effect if setID changes in the URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!setInfo) {
        setError("No hay datos del set para guardar.");
        return;
    }

    const nuevoSet = {
      nombre: setInfo.name,
      numero: setInfo.set_num,
      piezas: setInfo.num_parts,
      ano: setInfo.year,
      tema: setInfo.theme,
      estado, // From form state
      precioCompra, // From form state
      fechaCompra, // From form state
      imagen: setInfo.img_url,
      setId: setInfo.set_id,
    };

    setSaveStatus("Guardando...");
    setError(null);

    try {
      // Send the newSetData to your backend for saving to SQLite
      const response = await fetch('http://localhost:4000/api/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoSet),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al guardar el set: ${response.status} ${response.statusText}`);
      }

      const savedSet = await response.json();
      console.log('Set guardado exitosamente:', savedSet);
      setSaveStatus("¡Set guardado exitosamente!");
      // Optionally, redirect to the collection page
      // navigate('/coleccion');
    } catch (err) {
      console.error('Error al guardar el set:', err);
      setSaveStatus(null);
      setError(`No se pudo guardar el set: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8 text-center text-blue-600 text-xl">
        Cargando detalles del set...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8 text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!setInfo) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8 text-center text-gray-600">
        No se encontraron datos para el Set ID: {setID}.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">{setInfo.name} ({setInfo.set_num})</h2>
      <img src={setInfo.img_url} alt={setInfo.name} className="w-64 h-auto mx-auto mb-4" />

      <ul className="text-gray-700 mb-6 space-y-1">
        <li><strong>Año:</strong> {setInfo.year}</li>
        <li><strong>Set ID:</strong> {setInfo.set_id}</li>
        <li><strong>Tema:</strong> {setInfo.theme}</li>
        <li><strong>Piezas:</strong> {setInfo.num_parts}</li>
        <li><strong>Precio estimado:</strong> {setInfo.price_estimated ?? "N/D"}</li>
      </ul>

      {saveStatus && (
        <p className={`text-lg font-semibold mt-4 mb-4 ${saveStatus.includes('exitosamente') ? 'text-green-600' : 'text-orange-600'}`}>
          {saveStatus}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="precioCompra" className="block text-sm font-medium text-gray-600">Precio de compra (€)</label>
          <input
            type="number"
            step="0.01"
            id="precioCompra"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="fechaCompra" className="block text-sm font-medium text-gray-600">Fecha de compra</label>
          <input
            type="date"
            id="fechaCompra"
            value={fechaCompra}
            onChange={(e) => setFechaCompra(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-600">Estado</label>
          <select
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="activo">Activo</option>
            <option value="retirado">Retirado</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Agregar a mi colección
        </button>
      </form>
    </div>
  );
}
